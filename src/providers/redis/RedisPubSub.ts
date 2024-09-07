import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import Redis from "ioredis";

export enum RedisPubSubChannels {
  SocketEvents = "rpg-api-socket-events",
}

@provideSingleton(RedisPubSub)
export class RedisPubSub {
  private subConnection: Redis;
  private pubConnection: Redis;

  constructor(private redisManager: RedisManager, private locker: Locker) {}

  public async init(): Promise<void> {
    this.subConnection = await this.redisManager.getPoolClient("redis-pubsub-sub");
    this.pubConnection = await this.redisManager.getPoolClient("redis-pubsub-pub");

    if (!this.subConnection || !this.pubConnection) {
      throw new Error("Connection to Redis failed.");
    }
  }

  public async subscribe(channel: RedisPubSubChannels, callback: (message: string) => void): Promise<void> {
    await this.subConnection.subscribe(channel);

    this.subConnection.on("message", async (ch, message) => {
      try {
        const canProceed = await this.locker.lock(`redis-pubsub-subscribe-${channel}`);

        if (!canProceed) {
          return;
        }

        if (ch === channel) {
          callback(message);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      } finally {
        await this.locker.unlock(`redis-pubsub-subscribe-${channel}`);
      }
    });
  }

  public async publish(channel: RedisPubSubChannels, message: string): Promise<void> {
    if (!this.pubConnection) {
      throw new Error("Redis publish connection not initialized.");
    }

    try {
      const canProceed = await this.locker.lock(`redis-pubsub-publish-${channel}`);

      if (!canProceed) {
        return;
      }

      await this.pubConnection.publish(channel, message);
    } catch (err) {
      console.error("Error publishing message:", err);
    } finally {
      await this.locker.unlock(`redis-pubsub-publish-${channel}`);
    }
  }

  public async unsubscribe(): Promise<void> {
    if (this.subConnection) {
      await this.subConnection.unsubscribe();
    }
  }
}
