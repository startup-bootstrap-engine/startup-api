import { NewRelic } from "@providers/analytics/NewRelic";
import { QUEUE_CLOSE_CHECK_MAX_TRIES } from "@providers/constants/QueueConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { Queue } from "bullmq";
import dayjs from "dayjs";

@provideSingleton(QueueActivityMonitor)
export class QueueActivityMonitor {
  connection: any;
  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private newRelic: NewRelic,
    private redisManager: RedisManager
  ) {
    setInterval(async () => {
      console.log(`Active queues: ${await this.getAllQueues()}`);
    }, 5000);
  }

  private readonly queueActivityNamespace = "queue-activity";

  // Method to update the last activity time for a queue
  public async updateQueueActivity(queueName: string): Promise<void> {
    const now = Date.now();
    await this.inMemoryHashTable.set(this.queueActivityNamespace, queueName, now.toString());
  }

  public async hasQueueActivity(queueName: string): Promise<boolean> {
    return await this.inMemoryHashTable.has(this.queueActivityNamespace, queueName);
  }

  public async getAllQueues(): Promise<string[]> {
    return await this.inMemoryHashTable.getAllKeys(this.queueActivityNamespace);
  }

  public async deleteQueueActivity(queueName: string): Promise<void> {
    await this.inMemoryHashTable.delete(this.queueActivityNamespace, queueName);
  }

  public async clearAllQueues(): Promise<void> {
    await this.inMemoryHashTable.deleteAll(this.queueActivityNamespace);
  }

  public async closeInactiveQueues(): Promise<void> {
    const queues = await this.inMemoryHashTable.getAll<string>(this.queueActivityNamespace);
    if (!queues) return;

    const totalActiveQueues = Object.keys(queues).length;

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      NewRelicSubCategory.Server,
      "TotalActiveQueues",
      totalActiveQueues
    );

    for (const [queueName, lastActivity] of Object.entries(queues)) {
      const now = dayjs();
      const lastActivityDate = dayjs(Number(lastActivity));

      if (now.diff(lastActivityDate, "millisecond") > 2000) {
        if (!this.connection) {
          this.connection = this.redisManager.client;
        }

        const queue = new Queue(queueName, {
          connection: this.connection,
        });

        try {
          // Check for active jobs
          const activeJobs = await queue.getActive();
          if (activeJobs.length > 0) {
            for (const job of activeJobs) {
              let tries = 0;
              while (tries < QUEUE_CLOSE_CHECK_MAX_TRIES && (await job.getState()) === "active") {
                // Wait for 1 second before checking the job state again
                await new Promise((resolve) => setTimeout(resolve, 1000));
                tries++;
              }
            }
          }

          await this.deleteQueueActivity(queueName); // Remove the queue from the centralized store
        } catch (error) {
          console.error(`Failed to remove inactive queue: ${queueName}`, error);
        }
      }
    }
  }
}
