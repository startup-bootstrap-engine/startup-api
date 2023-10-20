import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import IORedis from "ioredis";
import mongoose from "mongoose";
import { applySpeedGooseCacheLayer } from "speedgoose";

//! We use RedisIOClient because it has a built in pooling mechanism
@provideSingleton(RedisIOClient)
export class RedisIOClient {
  public async connect(): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      let client;

      try {
        const redisConnectionUrl = `redis://${appEnv.database.REDIS_CONTAINER}:${appEnv.database.REDIS_PORT}`;

        client = new IORedis(redisConnectionUrl, {
          maxRetriesPerRequest: null,
        });

        client.setMaxListeners(20);

        if (!appEnv.general.IS_UNIT_TEST) {
          client.on("connect", () => {
            if (!appEnv.general.IS_UNIT_TEST) {
              console.log("✅ Redis Client Connected");
            }
          });
        }

        client.on("error", (err) => {
          console.log("❌ Redis error:", err);
          reject(err);
        });

        // @ts-ignore
        void applySpeedGooseCacheLayer(mongoose, {
          redisUri: redisConnectionUrl,
        });

        resolve(client);
      } catch (error) {
        if (!appEnv.general.IS_UNIT_TEST) {
          client.removeAllListeners("error");
        }

        console.log("❌ Redis initialization error: ", error);
        reject(error);
      }
    });
  }
}
