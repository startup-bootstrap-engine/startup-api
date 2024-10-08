/* src/providers/messaging/MessagingBroker.ts */

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

  sendMessage<T>(service: string, action: string, data: T): void {
    this.ensureInitialized()
      .then(() => {
        const routingKey = `${service}.${action}`;
        return this.rabbitMQ.publishMessage(MessagingBroker.EXCHANGE, routingKey, data);
      })
      .catch((error) => {
        console.error(`Failed to send message: ${error.message}`);
      });
  }

  async listenForMessages(
    service: string,
    action: string,
    callback: (data: any) => Promise<void> | void
  ): Promise<void> {
    await this.ensureInitialized();
    const routingKey = `${service}.${action}`;
    const queue = `${service}_${action}_queue`;

    await this.rabbitMQ.assertQueue(queue);
    await this.rabbitMQ.bindQueue(queue, MessagingBroker.EXCHANGE, routingKey);
    await this.rabbitMQ.consumeMessages(MessagingBroker.EXCHANGE, queue, routingKey, async (data) => {
      await callback(data);
    });
  }

  async close(): Promise<void> {
    await this.rabbitMQ.close();
  }
}
