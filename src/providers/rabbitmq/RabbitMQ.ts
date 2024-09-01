import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import amqp, { Channel, Connection } from "amqplib";

@provideSingleton(RabbitMQ)
export class RabbitMQ {
  public connection: Connection | null = null;
  public channel: Channel | null = null;

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

    try {
      const { host, port, username, password } = appEnv.rabbitmq;
      const url = `amqp://${username}:${password}@${host}:${port}`;
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      console.log(`✅ Successfully connected to RabbitMQ at ${url}`);
    } catch (error) {
      console.error("❌ Error connecting to RabbitMQ:", error);
      throw error;
    }
  }

  async createQueue(queue: string): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    await this.channel.assertQueue(queue, { durable: true });

    console.log(`✅ Created queue: ${queue}`);
  }

  async sendMessage(queue: string, message: string): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    console.log(`📩 Sending message to queue ${queue}:`, message);
    await this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async assertExchange(exchange: string, type: string): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    await this.channel.assertExchange(exchange, type, { durable: true });
    console.log(`✅ Exchange ${exchange} asserted`);
  }

  async publishMessage(exchange: string, routingKey: string, data: any): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    const message = Buffer.from(JSON.stringify(data));
    const options = {
      persistent: true,
      contentType: "application/json",
    };
    const result = await this.channel.publish(exchange, routingKey, message, options);
    console.log(`Message published to ${exchange} with routing key ${routingKey}. Result: ${result}`);
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
    console.log(`Setting up consumer for queue: ${queue}, exchange: ${exchange}, routingKey: ${routingKey}`);
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, routingKey);
    await this.channel.consume(queue, async (msg) => {
      if (msg) {
        console.log(`Received message on ${queue} with routing key ${msg.fields.routingKey}`);
        const content = msg.content.toString();
        console.log(`Raw message content: ${content}`);
        try {
          const data = content ? JSON.parse(content) : null;
          console.log("Parsed message data:", data);
          await callback(data);
          this.channel!.ack(msg);
          console.log("Message processed and acknowledged");
        } catch (error) {
          console.error("Error processing message:", error);
          console.error("Raw message content:", content);
          this.channel!.ack(msg);
          console.log("Error occurred, but message acknowledged");
        }
      }
    });
    console.log(`Consumer set up for ${queue} with routing key ${routingKey}`);
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
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    await this.channel.assertQueue(queue, { durable: true });
    console.log(`Queue ${queue} asserted`);
  }

  async bindQueue(queue: string, exchange: string, routingKey: string): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    await this.channel.bindQueue(queue, exchange, routingKey);
    console.log(`Queue ${queue} bound to exchange ${exchange} with routing key ${routingKey}`);
  }
}
