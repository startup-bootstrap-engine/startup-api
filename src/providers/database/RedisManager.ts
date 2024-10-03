import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Redis } from "ioredis";
import { RedisBareClient } from "./RedisManager/RedisBareClient";
import { RedisClientConnectionManager } from "./RedisManager/RedisClientConnectionManager";
import { RedisIOClient } from "./RedisManager/RedisIOClient";

@provideSingleton(RedisManager)
export class RedisManager {
  private maxRetries: number = 5;
  private retryDelay: number = 1000; // Start with 1 second
  public client: Redis | null | void = null;

  constructor(
    private redisBareClient: RedisBareClient,
    private redisIOClient: RedisIOClient,
    private redisClientConnectionManager: RedisClientConnectionManager
  ) {}

  public async connect(retries: number = this.maxRetries): Promise<void> {
    if (!appEnv.modules.redis) {
      throw new Error(
        "⚠️ Redis module is not enabled. Please set MODULE_REDIS=true in your .env and run yarn module:build"
      );
    }

    if (this.client) return;

    try {
      this.client = appEnv.general.IS_UNIT_TEST
        ? await this.redisBareClient.connect()
        : await this.redisIOClient.connect();

      if (!appEnv.general.IS_UNIT_TEST) {
        console.log("✅ Successfully connected to Redis.");
      }

      this.setupEventListeners();
    } catch (error) {
      console.error("❌ Redis connection failed:", error);
      if (retries > 0) {
        console.log(`Retrying in ${this.retryDelay}ms...`);
        setTimeout(() => this.connect(retries - 1), this.retryDelay);
        this.retryDelay *= 2; // Exponential backoff
      } else {
        console.error("Max retries reached. Failed to connect to Redis.");
      }
    }
  }

  private setupEventListeners(): void {
    this.client?.on("error", async (error: NodeJS.ErrnoException) => {
      console.error("Redis error:", error);

      // Basic error handling; consider expanding based on your needs
      if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        console.log(`${error.code} - Redis connection error. Attempting to reconnect...`);
        this.client = null; // Ensure client is marked as disconnected
        await this.connect(); // Attempt to reconnect with default retries
      }
    });

    this.client?.on("end", async () => {
      console.log("Redis connection closed. Attempting to reconnect...");
      this.client = null; // Mark the client as disconnected
      await this.connect(); // Attempt to reconnect
    });
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  public async getClientCount(): Promise<number> {
    return await this.redisClientConnectionManager.getConnectedClientCount(this.client!);
  }

  public async getPoolClient(connectionName: string): Promise<Redis> {
    return await this.redisIOClient.getPoolClient(connectionName);
  }

  public async releasePoolClient(client: Redis): Promise<void> {
    await this.redisIOClient.releasePoolClient(client);
  }
}
