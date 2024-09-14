/* src/providers/rabbitmq/RabbitMQ.ts */

import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import amqp, { Channel, Connection, Options } from "amqplib";

@provideSingleton(RabbitMQ)
export class RabbitMQ {
  public connection: Connection | null = null;
  public channel: Channel | null = null;

  private reconnecting: boolean = false;

  private async retryOperation<T>(operation: () => Promise<T>, retries = 5, delay = 5000): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Operation failed, retrying in ${delay}ms... Attempt ${i + 1} of ${retries}`, error);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Operation failed after multiple retries");
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  isChannelValid(): boolean {
    return this.channel !== null && this.channel.connection !== null && this.channel.connection.closeEmitted === false;
  }

  async connect(): Promise<void> {
    if (this.isConnected() && this.isChannelValid()) {
      console.log("RabbitMQ is already connected and the channel is valid");
      return;
    }

    await this.retryOperation(async () => {
      const { host, port, username, password } = appEnv.rabbitmq;
      const url = `amqp://${username}:${password}@${host}:${port}`;
      const connectionOptions: Options.Connect = {
        heartbeat: 60, // Heartbeat interval in seconds
        reconnect: true, // Custom option for handling reconnections
      };
      this.connection = await amqp.connect(url, connectionOptions);
      this.channel = await this.connection.createChannel();
      console.log(`✅ Successfully connected to RabbitMQ at ${url}`);

      // Handle connection close and errors
      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
        this.connection = null;
        this.channel = null;
        void this.handleReconnection();
      });

      this.connection.on("close", () => {
        console.warn("RabbitMQ connection closed");
        this.connection = null;
        this.channel = null;
        void this.handleReconnection();
      });
    });
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnecting) return;
    this.reconnecting = true;
    console.log("Attempting to reconnect to RabbitMQ...");

    const retryDelay = 5000; // 5 seconds
    const maxRetries = 10;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await this.connect();
        console.log("✅ Reconnected to RabbitMQ successfully");
        this.reconnecting = false;
        return;
      } catch (error) {
        attempt++;
        console.error(`❌ Reconnection attempt ${attempt} failed. Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    console.error("❌ Failed to reconnect to RabbitMQ after multiple attempts");
    this.reconnecting = false;
  }

  async createQueue(queue: string): Promise<void> {
    await this.retryOperation(async () => {
      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }
      await this.channel.assertQueue(queue, { durable: true });
      console.log(`✅ Created queue: ${queue}`);
    });
  }

  async sendMessage(queue: string, message: string): Promise<void> {
    // eslint-disable-next-line require-await
    await this.retryOperation(async () => {
      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }

      const sent = this.channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      if (!sent) {
        throw new Error("Failed to send message to queue");
      }
    });
  }

  async assertExchange(exchange: string, type: string): Promise<void> {
    await this.retryOperation(async () => {
      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }
      await this.channel.assertExchange(exchange, type, { durable: true });
      console.log(`✅ Exchange ${exchange} asserted`);
    });
  }

  async publishMessage(exchange: string, routingKey: string, data: any): Promise<void> {
    // eslint-disable-next-line require-await
    await this.retryOperation(async () => {
      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }
      const message = Buffer.from(JSON.stringify(data));
      const options = {
        persistent: true,
        contentType: "application/json",
      };
      const published = this.channel.publish(exchange, routingKey, message, options);
      if (!published) {
        throw new Error("Failed to publish message");
      }
    });
  }

  async consumeMessages(
    exchange: string,
    queue: string,
    routingKey: string,
    callback: (data: any) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, routingKey);
    console.log(`✅ Bound queue ${queue} to exchange ${exchange} with routing key ${routingKey}`);

    await this.channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          const content = msg.content.toString();
          try {
            const data = content ? JSON.parse(content) : null;
            await callback(data);
            this.channel!.ack(msg);
          } catch (error) {
            console.error("Error processing message:", error);
            console.error("Raw message content:", content);
            this.channel!.nack(msg, false, false); // Discard the message
            console.log("❌ Message rejected and discarded");
          }
        }
      },
      { noAck: false }
    );

    console.log(`✅ Started consuming messages from queue: ${queue}`);
  }

  async closeConnection(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
      console.log("✅ RabbitMQ channel closed");
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      console.log("✅ RabbitMQ connection closed");
    }
  }

  async close(): Promise<void> {
    await this.closeConnection();
  }

  async assertQueue(queue: string): Promise<void> {
    await this.retryOperation(async () => {
      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }
      await this.channel.assertQueue(queue, { durable: true });
    });
  }

  async bindQueue(queue: string, exchange: string, routingKey: string): Promise<void> {
    await this.retryOperation(async () => {
      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }
      await this.channel.bindQueue(queue, exchange, routingKey);
    });
  }

  async deleteQueue(queue: string): Promise<void> {
    await this.retryOperation(async () => {
      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }
      await this.channel.deleteQueue(queue);
    });
  }
}
