import { appEnv } from "@providers/config/env";
import { SERVER_API_NODES_PM2_PROCESSES_QTY, SERVER_API_NODES_QTY } from "@providers/constants/ServerConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Pool, createPool } from "generic-pool";
import IORedis, { Redis, RedisOptions } from "ioredis";
import mongoose from "mongoose";
import { applySpeedGooseCacheLayer } from "speedgoose";

@provideSingleton(RedisIOClient)
export class RedisIOClient {
  private static instance: RedisIOClient;
  private pool: Pool<Redis> | null = null;
  public client: Redis | null = null;

  private readonly redisConnectionURL: string = `redis://${appEnv.database.REDIS_CONTAINER}:${appEnv.database.REDIS_PORT}`;

  private constructor() {}

  public static getInstance(): RedisIOClient {
    if (!RedisIOClient.instance) {
      RedisIOClient.instance = new RedisIOClient();
    }
    return RedisIOClient.instance;
  }

  public async connect(): Promise<Redis> {
    if (!this.pool) {
      const poolSize = Math.min(
        Math.round(500 / SERVER_API_NODES_QTY / SERVER_API_NODES_PM2_PROCESSES_QTY),
        100 // Upper limit on the pool size for safety
      );
      this.pool = createPool<Redis>(
        {
          create: async () => await new IORedis(this.redisConnectionURL, this.getIOClientConfig()),
          destroy: async (client) => await client.disconnect(),
          validate: async (client) => (await client.ping()) === "PONG",
        },
        {
          max: poolSize,
          min: Math.max(Math.round(170 / SERVER_API_NODES_QTY / SERVER_API_NODES_PM2_PROCESSES_QTY), 10),
          testOnBorrow: true,
          idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
        }
      );

      // @ts-ignore
      this.pool.on("factoryCreateError", (err) => {
        console.error("Redis Pool Create Error", err);
      });

      // @ts-ignore
      this.pool.on("factoryDestroyError", (err) => {
        console.error("Redis Pool Destroy Error", err);
      });

      // @ts-ignore
      void applySpeedGooseCacheLayer(mongoose, {
        redisUri: this.redisConnectionURL,
      });

      this.client = await this.getPoolClient("main-connection");
    }
    return this.client!;
  }

  public async getPoolClient(connectionName: string): Promise<Redis> {
    if (!this.pool) {
      throw new Error("Redis pool has not been initialized. Call connect() first.");
    }
    let client: Redis | null = null;
    try {
      client = await this.pool.acquire();
      await client.client("SETNAME", connectionName);
    } catch (error) {
      if (client) {
        await this.pool.release(client);
      }
      throw error; // Re-throw after releasing the client
    }
    return client;
  }

  public isClientOnPool(client: Redis): boolean {
    if (!this.pool) {
      throw new Error("Redis pool has not been initialized. Call connect() first.");
    }
    return this.pool.isBorrowedResource(client);
  }

  public async releasePoolClient(client: Redis): Promise<void> {
    if (this.pool && this.isClientOnPool(client)) {
      await this.pool.release(client);
    }
  }

  private getIOClientConfig(): RedisOptions {
    return {
      retryStrategy: (times): number => {
        const delay = Math.min(50 * Math.pow(2, times), 30000); // Exponential backoff up to 30 seconds
        const jitter = Math.random() * 100; // Add jitter to prevent thundering herd
        return delay + jitter;
      },
      enableAutoPipelining: true,
      keepAlive: 10000,
      connectTimeout: 15000,
      maxRetriesPerRequest: null,
      autoResendUnfulfilledCommands: true,
      reconnectOnError: (err): boolean => {
        return /READONLY|CONNECTION_LOST|ECONNRESET|ETIMEDOUT|ECONNREFUSED|ENETDOWN/i.test(err.message);
      },
    };
  }

  public async shutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.drain();
      await this.pool.clear();
    }
  }
}
