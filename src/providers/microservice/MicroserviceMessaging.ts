import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Time } from "@providers/time/Time";
import { v4 as uuidv4 } from "uuid";
import { RabbitMQService } from "./RabbitMQService";

@provideSingleton(MicroserviceMessaging)
export class MicroserviceMessaging {
  private static EXCHANGE = "rpg_microservices";

  constructor(private rabbitMQService: RabbitMQService, private time: Time) {}

  async initialize(): Promise<void> {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.rabbitMQService.connect();
        await this.rabbitMQService.assertExchange(MicroserviceMessaging.EXCHANGE, "topic");
        console.log("✅ Successfully connected to RabbitMQ and asserted exchange");
        return;
      } catch (error) {
        console.error(`Failed to initialize RabbitMQ connection. Retries left: ${retries}`);
        retries--;
        await this.time.waitForSeconds(5); // Wait for 5 seconds before retrying
      }
    }
    throw new Error("Failed to initialize RabbitMQ connection after multiple retries");
  }

  async sendRequest(service: string, action: string, data: any): Promise<any> {
    const routingKey = `${service}.${action}`;
    const correlationId = uuidv4();
    const replyQueue = await this.rabbitMQService.channel!.assertQueue("", { exclusive: true });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timed out after 30 seconds for ${service}.${action}`));
      }, 30000);

      this.rabbitMQService.channel!.consume(
        replyQueue.queue,
        (msg) => {
          if (msg?.properties.correlationId === correlationId) {
            clearTimeout(timeout);
            console.log(`Received response for ${service}.${action} with correlationId ${correlationId}`);
            resolve(JSON.parse(msg.content.toString()));
          }
        },
        { noAck: true }
      );

      this.rabbitMQService.channel!.publish(
        MicroserviceMessaging.EXCHANGE,
        routingKey,
        Buffer.from(JSON.stringify(data)),
        {
          correlationId: correlationId,
          replyTo: replyQueue.queue,
        }
      );

      console.log(`Request sent to ${service}.${action} with correlationId ${correlationId}`);
    });
  }

  async sendMessage(service: string, action: string, data: any): Promise<void> {
    const routingKey = `${service}.${action}`;
    await this.rabbitMQService.publishMessage(MicroserviceMessaging.EXCHANGE, routingKey, data);
  }

  async listenForMessages(service: string, action: string, callback: (data: any) => Promise<void>): Promise<void> {
    const routingKey = `${service}.${action}`;
    const queue = `${service}_${action}_queue`;
    await this.rabbitMQService.consumeMessages(MicroserviceMessaging.EXCHANGE, queue, routingKey, callback);
  }

  async close(): Promise<void> {
    await this.rabbitMQService.closeConnection();
  }
}
