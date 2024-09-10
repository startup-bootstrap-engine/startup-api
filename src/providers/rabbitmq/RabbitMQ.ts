import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import amqp, { Channel, Connection } from "amqplib";

@provideSingleton(RabbitMQ)
export class RabbitMQ {
  public connection: Connection | null = null;
  public channel: Channel | null = null;

  private async retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) throw error;
        console.warn(`Operation failed, retrying in ${delay}ms...`, error);
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
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      console.log(`✅ Successfully connected to RabbitMQ at ${url}`);
    });
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
    await this.retryOperation(async () => {
      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }

      await this.channel.sendToQueue(queue, Buffer.from(message));
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
    await this.retryOperation(async () => {
      if (!this.channel) {
        throw new Error("RabbitMQ channel not initialized");
      }
      const message = Buffer.from(JSON.stringify(data));
      const options = {
        persistent: true,
        contentType: "application/json",
      };
      await this.channel.publish(exchange, routingKey, message, options);
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
    await this.channel.consume(queue, async (msg) => {
      if (msg) {
        const content = msg.content.toString();
        try {
          const data = content ? JSON.parse(content) : null;
          await callback(data);
          this.channel!.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error);
          console.error("Raw message content:", content);
          this.channel!.ack(msg);
          console.log("Error occurred, but message acknowledged");
        }
      }
    });
  }

  async closeConnection(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
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
    await this.channel.deleteQueue(queue);
  }
}
