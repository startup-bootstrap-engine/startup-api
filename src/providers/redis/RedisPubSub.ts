import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import Redis from "ioredis";

export enum RedisPubSubChannels {
  SocketEvents = "rpg-api-socket-events",
}

@provideSingleton(RedisPubSub)
export class RedisPubSub {
  private subConnection: Redis;
  private pubConnection: Redis;

  constructor(private redisManager: RedisManager) {}

  public async init(): Promise<void> {
    this.subConnection = await this.redisManager.getPoolClient("redis-pubsub-sub");
    this.pubConnection = await this.redisManager.getPoolClient("redis-pubsub-pub");

    if (!this.subConnection || !this.pubConnection) {
      throw new Error("Connection to Redis failed.");
    }
  }

  public async subscribe(channel: RedisPubSubChannels, callback: (message: string) => void): Promise<void> {
    await this.subConnection.subscribe(channel);

    this.subConnection.on("message", (ch, message) => {
      if (ch === channel) {
        callback(message);
      }
    });
  }

  public async publish(channel: RedisPubSubChannels, message: string): Promise<void> {
    if (!this.pubConnection) {
      throw new Error("Redis publish connection not initialized.");
    }

    await this.pubConnection.publish(channel, message);
  }
}
