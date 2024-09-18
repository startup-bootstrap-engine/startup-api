/* eslint-disable require-await */
/* src/providers/rabbitmq/RabbitMQ.ts */

import { appEnv } from "@providers/config/env";
import { SERVER_API_NODES_QTY } from "@providers/constants/ServerConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import amqp, { Channel, Connection, Message, Options } from "amqplib";

interface IConsumerConfig {
  exchange: string;
  queue: string;
  routingKey: string;
  callback: (data: any) => Promise<void>;
}

@provideSingleton(RabbitMQ)
export class RabbitMQ {
  private connection: Connection | null = null;
  private publishChannel: Channel | null = null;

  private reconnecting: boolean = false;
  private readonly retryDelay: number = 5000;
  private readonly maxRetries: number = 10;
  private currentRetries: number = 0;

  private consumers: IConsumerConfig[] = [];
  private consumerChannels: Map<string, Channel> = new Map();

  constructor() {
    this.connect().catch((err) => {
      console.error("Initial connection failed:", err);
      void this.handleReconnection();
    });
  }

  private isChannelValid(channel: Channel | null): boolean {
    return (
      channel !== null &&
      !channel._closing &&
      !channel._closed &&
      channel.connection !== null &&
      !channel.connection.closeEmitted &&
      !channel.connection.stream.destroyed
    );
  }

  private async retryOperation<T>(operation: () => Promise<T>, retries = 5, delay = 5000): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Operation failed, retrying in ${delay}ms... Attempt ${i + 1} of ${retries}`, error);
        await this.delay(delay);
      }
    }
    throw new Error("Operation failed after multiple retries");
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async connect(): Promise<void> {
    if (this.connection && this.isChannelValid(this.publishChannel)) {
      console.log("RabbitMQ is already connected and channels are valid");
      return;
    }

    await this.retryOperation(async () => {
      const { host, port, username, password } = appEnv.rabbitmq;
      const url = `amqp://${encodeURIComponent(username!)}:${encodeURIComponent(password!)}@${host}:${port}`;
      const connectionOptions: Options.Connect = {
        heartbeat: 15,
      };
      this.connection = await amqp.connect(url, connectionOptions);
      console.log(`✅ Successfully connected to RabbitMQ at ${url}`);

      this.publishChannel = await this.connection.createChannel();

      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
        this.cleanup();
        void this.handleReconnection();
      });

      this.connection.on("close", () => {
        console.error("RabbitMQ connection closed");
        this.cleanup();
        void this.handleReconnection();
      });

      this.publishChannel.on("error", (err) => {
        console.error("Publish channel error:", err);
      });

      this.publishChannel.on("close", () => {
        console.warn("Publish channel closed");
      });

      await this.reestablishConsumers();
    });
  }

  private cleanup(): void {
    this.connection = null;
    this.publishChannel = null;
    this.consumerChannels.clear();
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnecting) return;
    this.reconnecting = true;

    while (this.currentRetries < this.maxRetries) {
      try {
        console.log(`Attempting to reconnect to RabbitMQ... (${this.currentRetries + 1}/${this.maxRetries})`);
        await this.connect();
        console.log("✅ Reconnected to RabbitMQ successfully");
        this.reconnecting = false;
        this.currentRetries = 0;
        return;
      } catch (error) {
        this.currentRetries++;
        console.error(
          `❌ Reconnection attempt ${this.currentRetries} failed. Retrying in ${this.retryDelay / 1000} seconds...`,
          error
        );
        await this.delay(this.retryDelay);
      }
    }

    console.error("❌ Failed to reconnect to RabbitMQ after multiple attempts");
    this.reconnecting = false;
  }

  private async reestablishConsumers(): Promise<void> {
    for (const consumer of this.consumers) {
      await this.setupConsumer(consumer.exchange, consumer.queue, consumer.routingKey, consumer.callback);
    }
  }

  public async consumeMessages(
    exchange: string,
    queue: string,
    routingKey: string,
    callback: (data: any) => Promise<void>
  ): Promise<void> {
    const consumerConfig: IConsumerConfig = {
      exchange,
      queue,
      routingKey,
      callback,
    };
    this.consumers.push(consumerConfig);
    await this.setupConsumer(exchange, queue, routingKey, callback);
  }

  private async setupConsumer(
    exchange: string,
    queue: string,
    routingKey: string,
    callback: (data: any) => Promise<void>
  ): Promise<void> {
    if (!this.connection || !this.isChannelValid(this.connection)) {
      await this.connect();
    }

    const channel = await this.connection.createChannel();
    await channel.prefetch(SERVER_API_NODES_QTY * 2);

    try {
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, exchange, routingKey);

      const { consumerTag } = await channel.consume(
        queue,
        async (msg: Message | null) => {
          if (msg) {
            const content = msg.content.toString();
            try {
              const data = content ? JSON.parse(content) : null;
              await callback(data);
              if (this.isChannelValid(channel)) {
                try {
                  channel.ack(msg);
                } catch (ackError) {
                  console.error("Failed to acknowledge message:", ackError, msg);
                }
              } else {
                console.warn("Consume channel invalid. Cannot acknowledge message.");
              }
            } catch (error) {
              console.error("Error processing message:", error);
              console.error("Raw message content:", content);
              if (this.isChannelValid(channel)) {
                try {
                  channel.nack(msg, false, false);
                  console.log(`❌ Message rejected and discarded with delivery tag ${msg.fields.deliveryTag}`);
                } catch (nackError) {
                  console.error("Failed to reject message:", nackError, msg);
                }
              } else {
                console.warn("Consume channel invalid. Cannot reject message.");
              }
            }
          }
        },
        { noAck: false }
      );

      this.consumerChannels.set(consumerTag, channel);

      channel.on("close", () => {
        console.warn(`Channel closed for consumer ${consumerTag}`);
        this.consumerChannels.delete(consumerTag);
        void this.setupConsumer(exchange, queue, routingKey, callback);
      });

      channel.on("error", (err) => {
        console.error(`Channel error for consumer ${consumerTag}:`, err);
      });
    } catch (consumptionError) {
      console.error("Failed to set up consumer:", consumptionError);
    }
  }

  public async sendMessage(queue: string, message: string): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        const sent = this.publishChannel.sendToQueue(queue, Buffer.from(message), { persistent: true });
        if (!sent) {
          throw new Error("Failed to send message to queue");
        }
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  public async assertExchange(exchange: string, type: string): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        await this.publishChannel.assertExchange(exchange, type, {
          durable: true,
        });
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  public async publishMessage(exchange: string, routingKey: string, data: any): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        const message = Buffer.from(JSON.stringify(data));
        const options = {
          persistent: true,
          contentType: "application/json",
        };
        const published = this.publishChannel.publish(exchange, routingKey, message, options);
        if (!published) {
          throw new Error("Failed to publish message");
        }
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  public async createQueue(queue: string): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        await this.publishChannel.assertQueue(queue, { durable: true });
        console.log(`✅ Created queue: "${queue}"`);
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  public async assertQueue(queue: string): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        await this.publishChannel.assertQueue(queue, { durable: true });
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  public async bindQueue(queue: string, exchange: string, routingKey: string): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        await this.publishChannel.bindQueue(queue, exchange, routingKey);
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  public async deleteQueue(queue: string): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        await this.publishChannel.deleteQueue(queue);
        console.log(`✅ Deleted queue: "${queue}"`);
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  public async close(): Promise<void> {
    try {
      for (const [consumerTag, channel] of this.consumerChannels) {
        try {
          await channel.close();
          console.log(`✅ Consumer channel closed for ${consumerTag}`);
        } catch (error) {
          console.error(`Error closing consumer channel for ${consumerTag}:`, error);
        }
      }
      this.consumerChannels.clear();
      if (this.publishChannel) {
        await this.publishChannel.close();
        console.log("✅ Publish channel closed");
        this.publishChannel = null;
      }
      if (this.connection) {
        await this.connection.close();
        console.log("✅ RabbitMQ connection closed");
        this.connection = null;
      }
    } catch (error) {
      console.error("Error while closing RabbitMQ connection/channels:", error);
    }
  }
}
