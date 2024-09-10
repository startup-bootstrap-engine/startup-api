import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

export enum RedisStreamChannels {
  SocketEvents = "rpg-api-socket-events",
}

@provideSingleton(RedisStreams)
export class RedisStreams {
  private streamConnection: Redis;
  private readonly MAX_STREAM_LENGTH = 10000; // Adjust this value as needed

  constructor(private redisManager: RedisManager) {}

  // Initialize the Redis connection
  public async init(): Promise<void> {
    this.streamConnection = await this.redisManager.getPoolClient("redis-streams");

    if (!this.streamConnection) {
      throw new Error("Connection to Redis failed.");
    }

    console.log("✅ Redis stream connection initialized.");
  }

  // Add a message to the Redis stream
  public async addToStream(channel: RedisStreamChannels, message: Record<string, any>): Promise<string> {
    if (!this.streamConnection) {
      throw new Error("Redis stream connection not initialized.");
    }

    try {
      const id = uuidv4();
      const jsonMessage = JSON.stringify({ id, ...message });
      const result = await this.streamConnection.xadd(channel, "*", "message", jsonMessage);

      if (!result) {
        throw new Error("Error adding message to stream: No result returned");
      }

      console.log(`Added message to stream ${channel}: ${jsonMessage}`);

      // Publish a notification
      await this.streamConnection.publish(channel, "new_message");

      // Check and trim the stream if necessary
      await this.checkAndTrimStream(channel);

      return result;
    } catch (err) {
      console.error(`Error adding message to stream ${channel}:`, err);
      throw err;
    }
  }

  private async checkAndTrimStream(channel: RedisStreamChannels): Promise<void> {
    try {
      const streamLength = await this.streamConnection.xlen(channel);
      if (streamLength > this.MAX_STREAM_LENGTH) {
        await this.trimStream(channel, this.MAX_STREAM_LENGTH);
        console.log(`Trimmed stream ${channel} to ${this.MAX_STREAM_LENGTH} messages`);
      }
    } catch (err) {
      console.error(`Error checking and trimming stream ${channel}:`, err);
    }
  }

  // Read from a Redis stream with proper loop control
  public async readFromStream(
    channel: RedisStreamChannels,
    callback: (message: any) => void,
    lastId: string = "0-0"
  ): Promise<void> {
    if (!this.streamConnection) {
      throw new Error("Redis stream connection not initialized.");
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const processStreamMessages = async () => {
      try {
        const result = await this.streamConnection.xread("COUNT", 100, "STREAMS", channel, lastId);
        if (result && result.length > 0) {
          const [[, messages]] = result;
          const pipeline = this.streamConnection.pipeline();

          // Set locks for each message in the pipeline
          for (const [id, [, _message]] of messages) {
            const lockKey = `stream:${channel}:${id}`;
            pipeline.set(lockKey, "1", "EX", 60, "NX");
          }

          const lockResults = await pipeline.exec();

          // Only process messages that were successfully locked
          const lockedMessages = messages.filter((_, idx) => lockResults?.[idx]?.[1] === "OK");

          for (const [id, [, message]] of lockedMessages) {
            try {
              const parsedMessage = JSON.parse(message);
              await callback(parsedMessage);
              lastId = id; // Update the last processed ID
            } catch (parseError) {
              console.error(`Error parsing message: ${parseError}`, message);
              await callback(message); // Ensure the raw message is still processed if parsing fails
            }
          }
        }
      } catch (err) {
        console.error("Error reading from stream:", err);
      }
    };

    // Process the initial stream messages
    void processStreamMessages();

    // Set up pub/sub for real-time notifications
    const pubSubClient = this.streamConnection.duplicate();
    await pubSubClient.subscribe(channel);

    pubSubClient.on("message", (ch) => {
      if (ch === channel) {
        void processStreamMessages();
      }
    });
  }

  // Trim the Redis stream to control length
  public async trimStream(channel: RedisStreamChannels, maxLen: number): Promise<void> {
    try {
      await this.streamConnection.xtrim(channel, "MAXLEN", "~", maxLen);
    } catch (err) {
      console.error("Error trimming stream:", err);
    }
  }

  // Delete a Redis stream
  public async deleteStream(channel: RedisStreamChannels): Promise<void> {
    try {
      await this.streamConnection.del(channel);
    } catch (err) {
      console.error("Error deleting stream:", err);
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
