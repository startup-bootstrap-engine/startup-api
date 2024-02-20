/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NewRelic } from "@providers/analytics/NewRelic";
import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import IORedis from "ioredis";
import mongoose from "mongoose";
import { applySpeedGooseCacheLayer } from "speedgoose";

//! We use RedisIOClient because it has a built in pooling mechanism
@provideSingleton(RedisIOClient)
export class RedisIOClient {
  public client: IORedis.Redis | null = null;

  constructor(private newRelic: NewRelic) {}

  public async connect(): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      try {
        const redisConnectionUrl = `redis://${appEnv.database.REDIS_CONTAINER}:${appEnv.database.REDIS_PORT}`;

        this.client = new IORedis(redisConnectionUrl, {
          retryStrategy: (times) => {
            // Exponential backoff with a maximum delay, considering Docker's internal networking
            return Math.min(times * 100, 3000);
          },
          enableAutoPipelining: true, // Maintain command pipelining
          keepAlive: 10000, // Keep connections alive longer to mitigate Docker networking quirks
          connectTimeout: 15000, // Allow more time for connections, given potential Docker network delays
          maxRetriesPerRequest: null, // Must be null for bullmq
          autoResendUnfulfilledCommands: true, // Ensure command continuity over reconnects
          reconnectOnError: (err) => {
            // Broaden reconnection triggers to include common network-related errors in containerized environments
            return /READONLY|CONNECTION_LOST|ECONNRESET|ETIMEDOUT|ECONNREFUSED|ENETDOWN/i.test(err.message);
          },
          // Docker Swarm can cause IP changes; DNS resolution retries help handle service IP updates
          dnsLookup: (address, callback) => callback(null, address),
          maxListeners: 50, // Adjust for potential high concurrency within the swarm
        });

        this.client.setMaxListeners(20);

        if (!appEnv.general.IS_UNIT_TEST) {
          this.client.on("connect", () => {
            if (!appEnv.general.IS_UNIT_TEST) {
              console.log("✅ Redis Client Connected");
            }
          });
        }

        this.client.on("error", (err) => {
          console.log("❌ Redis error:", err);

          this.client?.disconnect();
          this.client?.removeAllListeners("error");

          this.client = null;

          reject(err);
        });

        // @ts-ignore
        void applySpeedGooseCacheLayer(mongoose, {
          redisUri: redisConnectionUrl,
        });

        // track new client
        this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Server, "RedisClient", 1);

        resolve(this.client);
      } catch (error) {
        if (!appEnv.general.IS_UNIT_TEST) {
          this.client?.removeAllListeners("error");
        }

        console.log("❌ Redis initialization error: ", error);
        reject(error);
      }
    });
  }

  public async getTotalConnectedClients(): Promise<number> {
    let clientCount = 0;

    try {
      const clientList = await this.client.client("LIST"); // Assuming this.client is the IORedis client
      clientCount = clientList.split("\n").length - 1; // Each client info is separated by a newline

      console.log("📕 Redis - Total connected clients: ", clientCount);

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Server,
        "RedisClientCount",
        clientCount
      );
    } catch (error) {
      console.error("Could not fetch the total number of connected clients", error);
    }
    return clientCount;
  }
}
