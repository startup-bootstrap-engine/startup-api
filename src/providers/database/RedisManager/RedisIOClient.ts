/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { appEnv } from "@providers/config/env";
import { SERVER_API_NODES_PM2_PROCESSES_QTY, SERVER_API_NODES_QTY } from "@providers/constants/ServerConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Pool, createPool } from "generic-pool";
import IORedis, { Redis, RedisOptions } from "ioredis";
import mongoose from "mongoose";
import { applySpeedGooseCacheLayer } from "speedgoose";

@provideSingleton(RedisIOClient)
export class RedisIOClient {
  private pool: Pool<Redis>;
  public client: Redis;

  private readonly redisConnectionURL: string = `redis://${appEnv.database.REDIS_CONTAINER}:${appEnv.database.REDIS_PORT}`;

  constructor() {}

  public async connect(): Promise<Redis> {
    this.pool = createPool<Redis>(
      {
        create: async () => {
          return await new IORedis(this.redisConnectionURL, this.getIOClientConfig());
        },
        destroy: async (client) => {
          return await client.disconnect();
        },
        validate: async (client) => {
          const result = await client.ping();

          return result === "PONG";
        },
      },
      {
        max: Math.round(450 / SERVER_API_NODES_QTY / SERVER_API_NODES_PM2_PROCESSES_QTY),
        min: Math.round(170 / SERVER_API_NODES_QTY / SERVER_API_NODES_PM2_PROCESSES_QTY),
        testOnBorrow: true,
      }
    );

    this.pool.on("factoryCreateError", (err) => {
      console.error("Redis Pool Create Error", err);
    });

    this.pool.on("factoryDestroyError", (err) => {
      console.error("Redis Pool Destroy Error", err);
    });

    // @ts-ignore
    void applySpeedGooseCacheLayer(mongoose, {
      redisUri: this.redisConnectionURL,
    });

    this.client = await this.getPoolClient("main-connection");

    return this.client;
  }

  public async getPoolClient(connectionName: string): Promise<Redis> {
    // check if client is already on pool

    const client = await this.pool.acquire();

    // Set a meaningful name for the connection for debugging purposes
    await client.client("SETNAME", connectionName);

    return client;
  }

  public isClientOnPool(client: Redis): boolean {
    return this.pool.isBorrowedResource(client);
  }

  public async releasePoolClient(client: Redis): Promise<void> {
    if (this.isClientOnPool(client)) {
      await this.pool.release(client);
    }
  }

  private getIOClientConfig(): RedisOptions {
    return {
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
    };
  }
}
