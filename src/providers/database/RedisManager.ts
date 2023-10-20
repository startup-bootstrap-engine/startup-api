import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import IORedis from "ioredis";
import mongoose from "mongoose";
import { applySpeedGooseCacheLayer } from "speedgoose";
@provideSingleton(RedisManager)
export class RedisManager {
  public client: IORedis.Redis;

  constructor() {}

  public connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const redisConnectionUrl = `redis://${appEnv.database.REDIS_CONTAINER}:${appEnv.database.REDIS_PORT}`;

        this.client = new IORedis(redisConnectionUrl, {
          maxRetriesPerRequest: null,
        });

        this.client.on("connect", () => {
          if (!appEnv.general.IS_UNIT_TEST) {
            console.log("✅ Redis Client Connected");
          }
          resolve();
        });

        this.client.on("error", (err) => {
          console.log("❌ Redis error:", err);
          reject(err);
        });

        // @ts-ignore
        void applySpeedGooseCacheLayer(mongoose, {
          redisUri: redisConnectionUrl,
        });
      } catch (error) {
        console.log("❌ Redis initialization error: ", error);
        reject(error);
      }
    });
  }
}
