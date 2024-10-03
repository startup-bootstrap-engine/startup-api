import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

export enum RedisPubSubChannels {
  SocketEvents = "startup-api-socket-events",
}

@provideSingleton(RedisPubSub)
export class RedisPubSub {
  private subConnection: Redis;
  private pubConnection: Redis;

  constructor(private redisManager: RedisManager) {}

  public async init(): Promise<void> {
    if (!appEnv.modules.redis) {
      throw new Error(
        "⚠️ Redis or RedisPubSub modules are not enabled. Please set MODULE_REDIS=true and MODULE_REDIS_PUBSUB=true in your .env and run yarn module:build"
      );
    }

    this.subConnection = await this.redisManager.getPoolClient("redis-pubsub-sub");
    this.pubConnection = await this.redisManager.getPoolClient("redis-pubsub-pub");

    if (!this.subConnection || !this.pubConnection) {
      throw new Error("Connection to Redis failed.");
    }
  }

  public async subscribe(channel: RedisPubSubChannels, callback: (message: string) => void): Promise<void> {
    await this.subConnection.subscribe(channel);

    this.subConnection.on("message", async (ch, message) => {
      if (ch === channel) {
        const { id, data } = JSON.parse(message);
        const lockKey = `processed:${id}`;

        const pipeline = this.pubConnection.pipeline();
        pipeline.set(lockKey, "1", "EX", 60, "NX");
        pipeline.get(lockKey);

        const results = await pipeline.exec();
        if (results?.[0][1] === "OK") {
          callback(data);
        }
      }
    });
  }

  public async publish(channel: RedisPubSubChannels, message: string): Promise<void> {
    if (!this.pubConnection) {
      throw new Error("Redis publish connection not initialized.");
    }

    try {
      const id = uuidv4();
      const wrappedMessage = JSON.stringify({ id, data: message });
      await this.pubConnection.publish(channel, wrappedMessage);
    } catch (err) {
      console.error("Error publishing message:", err);
    }
  }

  public async unsubscribe(): Promise<void> {
    if (this.subConnection) {
      await this.subConnection.unsubscribe();
    }
  }
}
