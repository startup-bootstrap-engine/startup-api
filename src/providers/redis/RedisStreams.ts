/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable require-await */
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Time } from "@providers/time/Time";
import Redis from "ioredis";

export enum RedisStreamChannels {
  SocketEvents = "rpg-api-socket-events",
}

@provideSingleton(RedisStreams)
export class RedisStreams {
  private streamConnection: Redis;
  private readonly MAX_STREAM_LENGTH = 10000;
  private readonly TRIM_INTERVAL_MS = 60000;
  private isShuttingDown = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(private redisManager: RedisManager, private time: Time) {}

  public async init(): Promise<void> {
    await this.connectToRedis();
    console.log("✅ Redis stream connection initialized.");

    for (const channel of Object.values(RedisStreamChannels)) {
      await this.ensureConsumerGroup(channel);
    }

    void this.startPeriodicTrim();
  }

  private async connectToRedis(): Promise<void> {
    try {
      this.streamConnection = await this.redisManager.getPoolClient("redis-streams");
      if (!this.streamConnection) {
        throw new Error("Connection to Redis failed.");
      }
      this.streamConnection.on("error", this.handleRedisError.bind(this));
      this.streamConnection.on("close", this.handleRedisClose.bind(this));
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      await this.scheduleReconnect();
    }
  }

  private handleRedisError(error: Error): void {
    console.error("Redis connection error:", error);
    if (!this.isShuttingDown) {
      void this.scheduleReconnect();
    }
  }

  private handleRedisClose(): void {
    if (!this.isShuttingDown) {
      void this.scheduleReconnect();
    }
  }

  private async scheduleReconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    await this.time.waitForMilliseconds(5000); // Wait before reconnecting
    if (!this.isShuttingDown) {
      await this.connectToRedis();
    }
  }

  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.streamConnection) {
      await this.streamConnection.quit();
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.streamConnection || this.streamConnection.status !== "ready") {
      await this.connectToRedis();
    }
  }

  private async ensureConsumerGroup(channel: RedisStreamChannels): Promise<void> {
    await this.ensureConnection();
    const groupName = this.getConsumerGroupName(channel);
    try {
      await this.streamConnection.xgroup("CREATE", channel, groupName, "$", "MKSTREAM");
      console.log(`Consumer group '${groupName}' created for channel '${channel}'.`);
    } catch (err) {
      if (err.message.includes("BUSYGROUP")) {
        console.log(`Consumer group '${groupName}' already exists for channel '${channel}'.`);
      } else {
        console.error(`Error ensuring consumer group for channel '${channel}':`, err);
        throw err;
      }
    }
  }

  private getConsumerGroupName(channel: RedisStreamChannels): string {
    return `${channel}_consumer_group`;
  }

  private generateConsumerName(channel: RedisStreamChannels): string {
    return `${channel}_consumer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async addToStream(channel: RedisStreamChannels, message: Record<string, any>): Promise<string | null> {
    if (!this.streamConnection) {
      throw new Error("Redis stream connection not initialized.");
    }

    try {
      const jsonMessage = JSON.stringify(message);
      const result = await this.streamConnection.xadd(channel, "*", "message", jsonMessage);

      if (!result) {
        throw new Error("Error adding message to stream: No result returned");
      }

      console.log(`Added message to stream ${channel}: ${jsonMessage}`);

      return result;
    } catch (err) {
      console.error(`Error adding message to stream ${channel}:`, err);
      throw err;
    }
  }

  public async readFromStream(channel: RedisStreamChannels, callback: (message: any) => Promise<void>): Promise<void> {
    const groupName = this.getConsumerGroupName(channel);
    const consumerName = this.generateConsumerName(channel);

    while (!this.isShuttingDown) {
      try {
        await this.ensureConnection();
        const result = await this.streamConnection.xreadgroup(
          "GROUP",
          groupName,
          consumerName,
          "COUNT",
          500, // Increased batch size
          "BLOCK",
          2000, // Reduced block time
          "STREAMS",
          channel,
          ">"
        );

        if (result && result.length > 0) {
          const [[, messages]] = result as any[];
          await Promise.all(
            messages.map(async ([id, [, message]]) => {
              try {
                const parsedMessage = JSON.parse(message);
                await callback(parsedMessage);
                await this.streamConnection.xack(channel, groupName, id);
              } catch (error) {
                console.error(`Error processing message ${id}:`, error);
                await this.streamConnection.xack(channel, groupName, id);
              }
            })
          );
        }
      } catch (error) {
        if (error.message.includes("NOGROUP")) {
          console.error(`Consumer group '${groupName}' does not exist. Recreating...`);
          await this.ensureConsumerGroup(channel);
        } else {
          console.error(`Error reading from stream ${channel}:`, error);
          await this.time.waitForMilliseconds(5000);
        }
      }
    }
  }

  private async trimStream(channel: RedisStreamChannels, maxLen: number): Promise<void> {
    try {
      await this.ensureConnection();
      await this.streamConnection.xtrim(channel, "MAXLEN", "~", maxLen);
    } catch (err) {
      console.error(`Error trimming stream '${channel}':`, err);
    }
  }

  private async startPeriodicTrim(): Promise<void> {
    while (!this.isShuttingDown) {
      try {
        for (const channel of Object.values(RedisStreamChannels)) {
          await this.trimStream(channel, this.MAX_STREAM_LENGTH);
        }
      } catch (err) {
        console.error("Error during periodic stream trimming:", err);
      }
      await this.time.waitForMilliseconds(this.TRIM_INTERVAL_MS);
    }
  }

  public async deleteStream(channel: RedisStreamChannels): Promise<void> {
    try {
      await this.streamConnection.del(channel);
      console.log(`Deleted stream '${channel}'.`);
    } catch (err) {
      console.error(`Error deleting stream '${channel}':`, err);
    }
  }

  public async clearAllStreams(): Promise<void> {
    try {
      const streamChannels = Object.values(RedisStreamChannels);
      for (const channel of streamChannels) {
        await this.deleteStream(channel);
      }
    } catch (err) {
      console.error("Error clearing all streams:", err);
    }
  }
}
