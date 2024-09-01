import { provideSingleton } from "@providers/inversify/provideSingleton";
import { RabbitMQ } from "@providers/rabbitmq/RabbitMQ";
import { Time } from "@providers/time/Time";

@provideSingleton(MicroserviceMessaging)
export class MicroserviceMessaging {
  private static EXCHANGE = "rpg_microservices";

  constructor(private rabbitMQ: RabbitMQ, private time: Time) {}

  async initialize(): Promise<void> {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.rabbitMQ.assertExchange(MicroserviceMessaging.EXCHANGE, "topic");
        console.log("✅ MicroserviceMessaging: ted to RabbitMQ and asserted exchange");
        return;
      } catch (error) {
        console.error(`❌ Failed to initialize RabbitMQ connection. Retries left: ${retries}`);
        if (error instanceof Error) {
          console.error(`❌ Error details: ${error.message}`);
        }
        retries--;
        if (retries > 0) {
          console.log("⚠️ Retrying in 5 seconds...");
          await this.time.waitForSeconds(5);
        }
      }
    }
    console.error("Failed to initialize RabbitMQ connection after multiple retries");
  }

  async sendMessage(service: string, action: string, data: any): Promise<void> {
    const routingKey = `${service}.${action}`;
    console.log(`📩 Sending message to ${routingKey}:`, data);
    await this.rabbitMQ.publishMessage(MicroserviceMessaging.EXCHANGE, routingKey, data);
  }

  async listenForMessages(service: string, action: string, callback: (data: any) => Promise<void>): Promise<void> {
    const routingKey = `${service}.${action}`;
    const queue = `${service}_${action}_queue`;

    await this.rabbitMQ.assertQueue(queue);
    await this.rabbitMQ.bindQueue(queue, MicroserviceMessaging.EXCHANGE, routingKey);
    await this.rabbitMQ.consumeMessages(MicroserviceMessaging.EXCHANGE, queue, routingKey, async (data) => {
      console.log(`📩 Received message on ${routingKey}:`, data);
      await callback(data);
    });
    console.log(`Listening for messages on ${routingKey} (queue: ${queue})`);
  }

  async close(): Promise<void> {
    await this.rabbitMQ.close();
  }
}
