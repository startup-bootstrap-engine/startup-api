import { NewRelic } from "@providers/analytics/NewRelic";
import { QUEUE_CLOSE_CHECK_MAX_TRIES, QUEUE_INACTIVITY_THRESHOLD_MS } from "@providers/constants/QueueConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { Queue } from "bullmq";
import dayjs from "dayjs";
import { Redis } from "ioredis";

@provideSingleton(QueueActivityMonitor)
export class QueueActivityMonitor {
  private connection: Redis | null = null;
  private readonly queueActivityNamespace = "queue-activity";

  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private newRelic: NewRelic,
    private redisManager: RedisManager
  ) {}

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

  public async shouldShutdownQueue(queueName: string): Promise<boolean> {
    const lastActivity = (await this.inMemoryHashTable.get(
      this.queueActivityNamespace,
      queueName
    )) as unknown as string;
    if (!lastActivity) return false;

    const now = dayjs();
    const lastActivityDate = dayjs(Number(lastActivity));
    return now.diff(lastActivityDate, "millisecond") > QUEUE_INACTIVITY_THRESHOLD_MS;
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

    for (const queueName of Object.keys(queues)) {
      if (await this.shouldShutdownQueue(queueName)) {
        await this.shutdownInactiveQueue(queueName);
      }
    }

    if (this.connection) {
      await this.redisManager.releasePoolClient(this.connection);
      this.connection = null;
    }
  }

  private async shutdownInactiveQueue(queueName: string): Promise<void> {
    if (!this.connection) {
      this.connection = await this.redisManager.getPoolClient("queue-activity-monitor");
    }

    const queue = new Queue(queueName, { connection: this.connection });

    try {
      await this.waitForActiveJobs(queue);
      await this.deleteQueueActivity(queueName);
    } catch (error) {
      console.error(`Failed to remove inactive queue: ${queueName}`, error);
    }
  }

  private async waitForActiveJobs(queue: Queue): Promise<void> {
    const activeJobs = await queue.getActive();
    for (const job of activeJobs) {
      let tries = 0;
      while (tries < QUEUE_CLOSE_CHECK_MAX_TRIES && (await job.getState()) === "active") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        tries++;
      }
    }
  }
}
