import { appEnv } from "@providers/config/env";
import { QUEUE_SCALE_FACTOR_DEFAULT } from "@providers/constants/QueueConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { EnvType } from "@rpg-engine/shared";
import { DefaultJobOptions, Job, Queue, QueueBaseOptions, Worker } from "bullmq";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

type QueueJobFn = (job: any) => Promise<void>;

@provideSingleton(MultiQueue)
export class MultiQueue {
  private connection: any;
  private defaultQueueOptions: QueueBaseOptions | null = null;
  private queues: Map<string, Queue> = new Map(); // Map to track initialized queues
  private workers: Map<string, Worker> = new Map(); // Map to keep track of workers by queue name

  constructor(private redisManager: RedisManager, private queueActivityMonitor: QueueActivityMonitor) {}

  public async addJob(
    prefix: string,
    scene: string,
    jobFn: QueueJobFn,
    data: Record<string, unknown>,
    queueScaleFactor: number = QUEUE_SCALE_FACTOR_DEFAULT,
    addQueueOptions?: DefaultJobOptions,
    queueOptions?: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): Promise<Job> {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.defaultQueueOptions) {
      this.defaultQueueOptions = {
        connection: this.connection,
        sharedConnection: true,
        ...queueOptions,
      };
    }

    const queueName = this.generateQueueName(prefix, scene, queueScaleFactor);
    let queue = this.queues.get(queueName);

    if (!queue) {
      queue = this.initQueue(queueName, jobFn, this.defaultQueueOptions, workerOptions);
      this.queues.set(queueName, queue);
    }

    return await queue.add(queueName, data, {
      removeOnComplete: true,
      removeOnFail: true,
      ...addQueueOptions,
    });
  }

  private initQueue(
    queueName: string,
    jobFn: QueueJobFn,
    queueOptions: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): Queue {
    const queue = new Queue(queueName, queueOptions);

    const worker = new Worker(
      queueName,
      async (job) => {
        try {
          await this.queueActivityMonitor.updateQueueActivity(queueName);

          await jobFn(job);
        } catch (error) {
          console.error(`Error processing ${queueName} job ${job.id}: ${error.message}`);
        }
      },
      {
        connection: this.connection,
        sharedConnection: true,
        ...workerOptions,
      }
    );

    this.workers.set(queueName, worker);

    return queue;
  }

  public async clearAllJobs(): Promise<void> {
    for (const [queueName, queue] of this.queues.entries()) {
      const jobs = await queue.getJobs(["waiting", "active", "delayed", "paused"]);
      for (const job of jobs) {
        await job
          .remove()
          .catch((err) => console.error(`Error removing job ${job.id} from queue ${queueName}:`, err.message));
      }
    }
  }

  public async shutdown(): Promise<void> {
    for (const [queueName, queue] of this.queues.entries()) {
      const worker = this.workers.get(queueName);
      if (worker) {
        await worker
          .close()
          .catch((err) => console.error(`Error shutting down worker for queue ${queueName}:`, err.message));
        // Optionally, remove the worker from the workers map if it's no longer needed
        this.workers.delete(queueName);
      }

      await queue.close().catch((err) => console.error(`Error shutting down queue ${queueName}:`, err.message));
      // Optionally, remove the queue from the queues map if it's no longer needed
      this.queues.delete(queueName);

      // Update the queue activity monitor if necessary
      await this.queueActivityMonitor.deleteQueueActivity(queueName);
    }
  }

  private generateQueueName(prefix: string, scene: string, queueScaleFactor: number): string {
    let envSuffix;

    switch (appEnv.general.ENV) {
      case EnvType.Development:
        envSuffix = "dev";
        break;
      default:
        envSuffix = process.env.pm_id || "prod";
        break;
    }

    return `${prefix}-${envSuffix}-${scene}-${queueScaleFactor}`;
  }
}
