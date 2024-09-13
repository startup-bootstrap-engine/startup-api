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
  private streamReader!: Redis;
  private streamWriter!: Redis;
  private isShuttingDown: boolean = false;
  private periodicTrimInterval: NodeJS.Timeout | null = null;

  constructor(private redisManager: RedisManager, private time: Time) {}

  /**
   * Initialize the RedisStreams by connecting to Redis and setting up consumer groups.
   */
  public async init(): Promise<void> {
    await this.connectToRedis();
    await this.initializeConsumerGroups();
    this.startPeriodicTrim();
  }

  /**
   * Connect to Redis for both reading and writing, and set up event listeners.
   */
  private async connectToRedis(): Promise<void> {
    try {
      // Initialize writer connection
      this.streamWriter = await this.redisManager.getPoolClient("redis-streams-writer");
      this.streamWriter.on("error", (error: Error) => this.handleRedisError(error, "Writer"));
      this.streamWriter.on("end", () => this.handleRedisClose("Writer"));

      // Initialize reader connection
      this.streamReader = await this.redisManager.getPoolClient("redis-streams-reader");
      this.streamReader.on("error", (error: Error) => this.handleRedisError(error, "Reader"));
      this.streamReader.on("end", () => this.handleRedisClose("Reader"));

      // Ensure both connections are ready
      await Promise.all([this.streamWriter.ping(), this.streamReader.ping()]);
      console.log("Connected to Redis successfully for both Reader and Writer.");
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      await this.scheduleReconnect();
    }
  }

  /**
   * Initialize consumer groups for all defined channels using the reader connection.
   */
  private async initializeConsumerGroups(): Promise<void> {
    for (const channel of Object.values(RedisStreamChannels)) {
      const groupName = this.getConsumerGroupName(channel);
      try {
        await this.streamReader.xgroup("CREATE", channel, groupName, "0", "MKSTREAM");
        console.log(`Consumer group '${groupName}' created for channel '${channel}'.`);
      } catch (error: any) {
        if (error.message.includes("BUSYGROUP")) {
          console.log(`Consumer group '${groupName}' already exists for channel '${channel}'.`);
        } else {
          console.error(`Error creating consumer group '${groupName}' for channel '${channel}':`, error);
          throw error; // Re-throw to prevent initialization if a critical error occurs
        }
      }
    }
  }

  /**
   * Gracefully shutdown the RedisStreams by closing connections and clearing intervals.
   */
  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    if (this.periodicTrimInterval) {
      clearInterval(this.periodicTrimInterval);
      this.periodicTrimInterval = null;
    }
    const shutdownPromises: Promise<void>[] = [];
    if (this.streamWriter) {
      // @ts-ignore
      shutdownPromises.push(this.streamWriter.quit());
      console.log("Redis writer connection closed gracefully.");
    }
    if (this.streamReader) {
      // @ts-ignore
      shutdownPromises.push(this.streamReader.quit());
      console.log("Redis reader connection closed gracefully.");
    }
    await Promise.all(shutdownPromises);
  }

  /**
   * Add a message to a specified Redis stream channel using the writer connection.
   * @param channel - The Redis stream channel.
   * @param message - The message to add.
   * @returns The ID of the added message or null if failed.
   */
  public async addToStream(channel: RedisStreamChannels, message: Record<string, any>): Promise<string | null> {
    try {
      // Ensure the writer connection is active
      if (!this.streamWriter || this.streamWriter.status !== "ready") {
        throw new Error("Writer connection is not active.");
      }

      const serializedMessage = this.serializeMessage(message);
      const messageId = await this.streamWriter.xadd(channel, "*", ...serializedMessage);
      return messageId;
    } catch (error) {
      console.error(`Failed to add message to stream '${channel}':`, error);
      // Optionally, you can implement retry logic here
      return null;
    }
  }

  /**
   * Read messages from a Redis stream channel using consumer groups with the reader connection.
   * @param channel - The Redis stream channel.
   * @param callback - The function to process each message.
   */
  public async readFromStream(channel: RedisStreamChannels, callback: (message: any) => Promise<void>): Promise<void> {
    const groupName = this.getConsumerGroupName(channel);
    const consumerName = this.generateConsumerName(channel);

    while (!this.isShuttingDown) {
      try {
        // Ensure the reader connection is active
        if (!this.streamReader || this.streamReader.status !== "ready") {
          throw new Error("Reader connection is not active.");
        }

        const streams = await this.streamReader.xreadgroup(
          "GROUP",
          groupName,
          consumerName,
          "COUNT",
          10,
          "BLOCK",
          5000, // 5 seconds
          "STREAMS",
          channel,
          ">"
        );

        if (streams) {
          // @ts-ignore
          for (const [stream, messages] of streams) {
            for (const [id, fields] of messages) {
              const message = this.deserializeMessage(fields);
              try {
                await callback(message);
                await this.streamReader.xack(channel, groupName, id);
              } catch (processingError) {
                console.error(`Error processing message ${id} from stream '${channel}':`, processingError);
                // Optionally, implement retry logic or move the message to a dead-letter queue
              }
            }
          }
        }
      } catch (error: any) {
        if (error.message.includes("NOGROUP")) {
          try {
            await this.streamReader.xgroup("CREATE", channel, groupName, "0", "MKSTREAM");
          } catch (createError: any) {
            if (!createError.message.includes("BUSYGROUP")) {
              await this.scheduleReconnect();
            }
          }
        } else {
          await this.time.waitForMilliseconds(5000); // Wait before retrying
        }
      }
    }
  }

  /**
   * Trim the Redis stream to a maximum length.
   * @param channel - The Redis stream channel.
   * @param maxLen - The maximum length of the stream.
   */
  private async trimStream(channel: RedisStreamChannels, maxLen: number): Promise<void> {
    try {
      // Use the writer connection for trimming
      if (!this.streamWriter || this.streamWriter.status !== "ready") {
        throw new Error("Writer connection is not active for trimming.");
      }

      await this.streamWriter.xtrim(channel, "MAXLEN", "~", maxLen);
      console.log(`Stream '${channel}' trimmed to max length ${maxLen}.`);
    } catch (error) {
      console.error(`Failed to trim stream '${channel}':`, error);
    }
  }

  /**
   * Start a periodic task to trim all streams.
   */
  private startPeriodicTrim(): void {
    const trimIntervalMs = 60 * 60 * 1000; // Every hour
    this.periodicTrimInterval = setInterval(async () => {
      for (const channel of Object.values(RedisStreamChannels)) {
        await this.trimStream(channel, 10000); // Example max length
      }
    }, trimIntervalMs);
  }

  /**
   * Delete a specific Redis stream.
   * @param channel - The Redis stream channel to delete.
   */
  public async deleteStream(channel: RedisStreamChannels): Promise<void> {
    try {
      // Use the writer connection for deletion
      if (!this.streamWriter || this.streamWriter.status !== "ready") {
        throw new Error("Writer connection is not active for deleting streams.");
      }

      await this.streamWriter.del(channel);
      console.log(`Stream '${channel}' deleted.`);
    } catch (error) {
      console.error(`Failed to delete stream '${channel}':`, error);
    }
  }

  /**
   * Clear all Redis streams managed by this class.
   */
  public async clearAllStreams(): Promise<void> {
    for (const channel of Object.values(RedisStreamChannels)) {
      await this.deleteStream(channel);
    }
  }

  /**
   * Handle Redis errors by logging and attempting reconnection.
   * @param error - The error encountered.
   * @param connectionType - The type of connection ('Reader' or 'Writer').
   */
  private handleRedisError(error: Error, connectionType: string): void {
    console.error(`Redis ${connectionType} connection error:`, error);
    // Depending on the error, you might want to initiate reconnection
  }

  /**
   * Handle Redis connection closure by attempting to reconnect.
   * @param connectionType - The type of connection ('Reader' or 'Writer').
   */
  private handleRedisClose(connectionType: string): void {
    if (!this.isShuttingDown) {
      console.warn(`Redis ${connectionType} connection closed. Attempting to reconnect...`);
      void this.scheduleReconnect();
    }
  }

  /**
   * Schedule a reconnection attempt after a delay.
   */
  private async scheduleReconnect(): Promise<void> {
    const retryDelay = 5000; // 5 seconds
    if (this.isShuttingDown) return;

    console.log(`Reconnecting to Redis in ${retryDelay / 1000} seconds...`);
    setTimeout(async () => {
      if (this.isShuttingDown) return;
      await this.connectToRedis();
      await this.initializeConsumerGroups();
    }, retryDelay);
  }

  /**
   * Generate the consumer group name for a given channel.
   * @param channel - The Redis stream channel.
   * @returns The consumer group name.
   */
  private getConsumerGroupName(channel: RedisStreamChannels): string {
    return `${channel}_consumer_group`;
  }

  /**
   * Generate a unique consumer name for a given channel.
   * @param channel - The Redis stream channel.
   * @returns The consumer name.
   */
  private generateConsumerName(channel: RedisStreamChannels): string {
    return `${channel}_consumer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serialize a message object into a flat array suitable for XADD.
   * @param message - The message object.
   * @returns An array of field-value pairs.
   */
  private serializeMessage(message: Record<string, any>): string[] {
    const serialized: string[] = [];
    for (const [key, value] of Object.entries(message)) {
      serialized.push(key, JSON.stringify(value));
    }
    return serialized;
  }

  /**
   * Deserialize a message from Redis fields.
   * @param fields - The array of fields returned by Redis.
   * @returns The deserialized message object.
   */
  private deserializeMessage(fields: string[]): Record<string, any> {
    const message: Record<string, any> = {};
    for (let i = 0; i < fields.length; i += 2) {
      const key = fields[i];
      const value = fields[i + 1];
      try {
        message[key] = JSON.parse(value);
      } catch {
        message[key] = value;
      }
    }
    return message;
  }
}
