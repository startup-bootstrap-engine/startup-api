import { NewRelic } from "@providers/analytics/NewRelic";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { Queue } from "bullmq";

@provideSingleton(QueuePerformanceTracker)
export class QueuePerformanceTracker {
  private queues: { [key: string]: Queue } = {};

  constructor(
    private newRelic: NewRelic,
    private inMemoryHashTable: InMemoryHashTable,
    private redisManager: RedisManager
  ) {}

  private getQueue(queueName: string): Queue {
    if (!this.queues[queueName]) {
      this.queues[queueName] = new Queue(queueName, {
        connection: this.redisManager.client,
      });
    }
    return this.queues[queueName];
  }

  public async trackQueuePerformanceRatio(): Promise<void> {
    const activeQueues = (await this.inMemoryHashTable.getAll<string>("queue-activity")) as Record<string, unknown>;

    for (const queueName of Object.keys(activeQueues)) {
      const queue = this.getQueue(queueName);
      const jobCounts = await queue.getJobCounts();

      const totalJobs = Object.values(jobCounts).reduce((acc: number, count: number) => acc + count, 0) as number;
      const waitingJobs = jobCounts.waiting;
      const clogRatio = totalJobs > 0 ? waitingJobs / totalJobs : 0;

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Server,
        `Queue/${queueName}/ClogRatio`,
        clogRatio
      );

      console.log(`Queue/${queueName}/ClogRatio: ${clogRatio} - Total: ${totalJobs} - Waiting: ${waitingJobs}`);

      this.removeQueue(queueName);
    }
  }

  private removeQueue(queueName: string): void {
    if (this.queues[queueName]) {
      delete this.queues[queueName];
    }
  }
}
