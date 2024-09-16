/* eslint-disable require-await */
/* src/providers/rabbitmq/RabbitMQ.ts */

import { appEnv } from "@providers/config/env";
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
  private consumeChannel: Channel | null = null;

  private reconnecting: boolean = false;
  private readonly retryDelay: number = 5000; // 5 seconds
  private readonly maxRetries: number = 10;
  private currentRetries: number = 0;

  private consumers: IConsumerConfig[] = [];

  constructor() {
    // Initialize connection on instantiation
    this.connect().catch((err) => {
      console.error("Initial connection failed:", err);
      void this.handleReconnection();
    });
  }

  /**
   * Checks if a given channel is valid.
   * @param channel The AMQP channel to check.
   * @returns Boolean indicating if the channel is valid.
   */
  private isChannelValid(channel: Channel | null): boolean {
    return (
      channel !== null &&
      channel.connection !== null &&
      !channel.connection.closeEmitted &&
      !channel.connection.stream.destroyed
    );
  }

  /**
   * Attempts to perform an operation with retries.
   * @param operation The asynchronous operation to perform.
   * @param retries Number of retry attempts.
   * @param delay Delay between retries in milliseconds.
   * @returns The result of the successful operation.
   */
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

  /**
   * Utility method to create a delay.
   * @param ms Milliseconds to delay.
   * @returns A promise that resolves after the specified delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Establishes a connection to RabbitMQ and sets up channels.
   */
  public async connect(): Promise<void> {
    if (this.connection && this.isChannelValid(this.publishChannel) && this.isChannelValid(this.consumeChannel)) {
      console.log("RabbitMQ is already connected and channels are valid");
      return;
    }

    await this.retryOperation(async () => {
      const { host, port, username, password } = appEnv.rabbitmq;
      const url = `amqp://${encodeURIComponent(username!)}:${encodeURIComponent(password!)}@${host}:${port}`;
      const connectionOptions: Options.Connect = {
        heartbeat: 60, // Heartbeat interval in seconds
      };
      this.connection = await amqp.connect(url, connectionOptions);
      console.log(`✅ Successfully connected to RabbitMQ at ${url}`);

      // Setup separate channels for publishing and consuming
      this.publishChannel = await this.connection.createChannel();
      this.consumeChannel = await this.connection.createChannel();

      // Optional: Set prefetch for consume channel to limit unacknowledged messages
      await this.consumeChannel.prefetch(10);
      console.log("✅ Publish and Consume channels are set up with prefetch=10");

      // Handle connection events
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

      // Handle channel close events
      this.publishChannel.on("error", (err) => {
        console.error("Publish channel error:", err);
      });

      this.publishChannel.on("close", () => {
        console.warn("Publish channel closed");
      });

      this.consumeChannel.on("error", (err) => {
        console.error("Consume channel error:", err);
      });

      this.consumeChannel.on("close", () => {
        console.warn("Consume channel closed");
        void this.handleReconnection();
      });

      // Re-establish consumers after setting up channels
      await this.reestablishConsumers();
    });
  }

  /**
   * Cleans up connection and channels.
   */
  private cleanup(): void {
    this.connection = null;
    this.publishChannel = null;
    this.consumeChannel = null;
  }

  /**
   * Handles reconnection logic with retries.
   */
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

  /**
   * Re-establishes all registered consumers after reconnection.
   */
  private async reestablishConsumers(): Promise<void> {
    for (const consumer of this.consumers) {
      await this.setupConsumer(consumer.exchange, consumer.queue, consumer.routingKey, consumer.callback);
    }
  }

  /**
   * Registers and sets up a consumer.
   * @param exchange The exchange to bind to.
   * @param queue The queue to consume from.
   * @param routingKey The routing key for binding.
   * @param callback The callback to process messages.
   */
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

  /**
   * Sets up a single consumer.
   * @param exchange The exchange to bind to.
   * @param queue The queue to consume from.
   * @param routingKey The routing key for binding.
   * @param callback The callback to process messages.
   */
  private async setupConsumer(
    exchange: string,
    queue: string,
    routingKey: string,
    callback: (data: any) => Promise<void>
  ): Promise<void> {
    if (!this.consumeChannel || !this.isChannelValid(this.consumeChannel)) {
      throw new Error("RabbitMQ consume channel not initialized or invalid");
    }

    await this.consumeChannel.assertQueue(queue, { durable: true });
    await this.consumeChannel.bindQueue(queue, exchange, routingKey);
    console.log(`✅ Bound queue "${queue}" to exchange "${exchange}" with routing key "${routingKey}"`);

    await this.consumeChannel.consume(
      queue,
      async (msg: Message | null) => {
        if (msg) {
          const content = msg.content.toString();
          try {
            const data = content ? JSON.parse(content) : null;
            await callback(data);
            if (this.isChannelValid(this.consumeChannel)) {
              this.consumeChannel.ack(msg);
            } else {
              console.warn("Consume channel invalid. Cannot acknowledge message.");
            }
          } catch (error) {
            console.error("Error processing message:", error);
            console.error("Raw message content:", content);
            if (this.isChannelValid(this.consumeChannel)) {
              this.consumeChannel.nack(msg, false, false); // Discard the message
              console.log(`❌ Message rejected and discarded with delivery tag ${msg.fields.deliveryTag}`);
            } else {
              console.warn("Consume channel invalid. Cannot reject message.");
            }
          }
        }
      },
      { noAck: false }
    );
  }

  /**
   * Sends a message to a specific queue.
   * @param queue The target queue.
   * @param message The message content.
   */
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

  /**
   * Asserts an exchange with the given type.
   * @param exchange The exchange name.
   * @param type The type of the exchange (e.g., 'direct', 'fanout', 'topic').
   */
  public async assertExchange(exchange: string, type: string): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        await this.publishChannel.assertExchange(exchange, type, {
          durable: true,
        });
        console.log(`✅ Exchange "${exchange}" asserted with type "${type}"`);
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  /**
   * Publishes a message to an exchange with a routing key.
   * @param exchange The target exchange.
   * @param routingKey The routing key.
   * @param data The message data.
   */
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

  /**
   * Creates a durable queue.
   * @param queue The queue name.
   */
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

  /**
   * Asserts a queue.
   * @param queue The queue name.
   */
  public async assertQueue(queue: string): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        await this.publishChannel.assertQueue(queue, { durable: true });
        console.log(`✅ Asserted queue: "${queue}"`);
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  /**
   * Binds a queue to an exchange with a routing key.
   * @param queue The queue name.
   * @param exchange The exchange name.
   * @param routingKey The routing key.
   */
  public async bindQueue(queue: string, exchange: string, routingKey: string): Promise<void> {
    await this.retryOperation(
      async () => {
        if (!this.publishChannel || !this.isChannelValid(this.publishChannel)) {
          throw new Error("RabbitMQ publish channel not initialized or invalid");
        }

        await this.publishChannel.bindQueue(queue, exchange, routingKey);
        console.log(`✅ Bound queue "${queue}" to exchange "${exchange}" with routing key "${routingKey}"`);
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  /**
   * Deletes a queue.
   * @param queue The queue name.
   */
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

  /**
   * Closes all channels and the connection gracefully.
   */
  public async close(): Promise<void> {
    try {
      if (this.consumeChannel) {
        await this.consumeChannel.close();
        console.log("✅ Consume channel closed");
        this.consumeChannel = null;
      }
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
