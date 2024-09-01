/* eslint-disable no-async-promise-executor */
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { RabbitMQ } from "@providers/rabbitmq/RabbitMQ";
import { Time } from "@providers/time/Time";

@provideSingleton(MessagingBroker)
export class MessagingBroker {
  private static EXCHANGE = "rpg_microservices";
  private initialized = false;

  constructor(private rabbitMQ: RabbitMQ, private time: Time) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    let retries = 5;
    while (retries > 0) {
      try {
        await this.rabbitMQ.connect();
        await this.rabbitMQ.assertExchange(MessagingBroker.EXCHANGE, "topic");
        this.initialized = true;
        console.log("✅ MessagingBroker: Connected to RabbitMQ and asserted exchange");
        return;
      } catch (error) {
        console.error(`❌ Failed to initialize RabbitMQ connection. Retries left: ${retries}`);
        retries--;
        if (retries > 0) {
          console.log("⚠️ Retrying in 5 seconds...");
          await this.time.waitForSeconds(5);
        }
      }
    }
    throw new Error("Failed to initialize RabbitMQ connection after multiple retries");
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async sendMessage(service: string, action: string, data: any): Promise<void> {
    await this.ensureInitialized();
    const routingKey = `${service}.${action}`;
    await this.rabbitMQ.publishMessage(MessagingBroker.EXCHANGE, routingKey, data);
  }

  async listenForMessages(service: string, action: string, callback: (data: any) => Promise<void>): Promise<void> {
    await this.ensureInitialized();
    const routingKey = `${service}.${action}`;
    const queue = `${service}_${action}_queue`;

    await this.rabbitMQ.assertQueue(queue);
    await this.rabbitMQ.bindQueue(queue, MessagingBroker.EXCHANGE, routingKey);
    await this.rabbitMQ.consumeMessages(MessagingBroker.EXCHANGE, queue, routingKey, async (data) => {
      console.log(`📩 Received message on ${routingKey}:`, data);
      await callback(data);
    });
    console.log(`Listening for messages on ${routingKey} (queue: ${queue})`);
  }

  async close(): Promise<void> {
    await this.rabbitMQ.close();
  }

  async sendAndWaitForResponse<T, R>(
    sendService: string,
    sendAction: string,
    receiveService: string,
    receiveAction: string,
    data: T,
    timeout: number = 30000
  ): Promise<R> {
    await this.ensureInitialized();
    return await new Promise<R>(async (resolve, reject) => {
      const correlationId = Math.random().toString(36).substring(2, 15);
      const replyQueue = `reply_${correlationId}`;

      await this.rabbitMQ.assertQueue(replyQueue);

      const timeoutId = setTimeout(async () => {
        reject(new Error("Timeout waiting for response"));
        await this.rabbitMQ.deleteQueue(replyQueue);
      }, timeout);

      await this.rabbitMQ.consumeMessages(
        MessagingBroker.EXCHANGE,
        replyQueue,
        `${receiveService}.${receiveAction}`,
        async (response: R) => {
          clearTimeout(timeoutId);
          resolve(response);
          await this.rabbitMQ.deleteQueue(replyQueue);
        }
      );

      await this.sendMessage(sendService, sendAction, { ...data, replyTo: replyQueue, correlationId });
    });
  }
}
