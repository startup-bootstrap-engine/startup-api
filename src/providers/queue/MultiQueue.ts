import { appEnv } from "@providers/config/env";
import { QueueDefaultScaleFactor } from "@providers/constants/QueueConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { EnvType } from "@rpg-engine/shared";
import { DefaultJobOptions, Job, Queue, QueueBaseOptions, Worker } from "bullmq";
import { random } from "lodash";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

type QueueJobFn = (job: any) => Promise<void>;

@provideSingleton(MultiQueue)
export class MultiQueue {
  private connection: any;
  private queues: Map<string, Queue> = new Map(); // Map to track initialized queues
  private workers: Map<string, Worker> = new Map(); // Map to keep track of workers by queue name

  constructor(private redisManager: RedisManager, private queueActivityMonitor: QueueActivityMonitor) {}

  public async addJob(
    prefix: string,
    jobFn: QueueJobFn,
    data: Record<string, unknown>,
    queueScaleFactor: number = QueueDefaultScaleFactor.Low,
    scene?: string,
    addQueueOptions?: DefaultJobOptions,
    queueOptions?: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): Promise<Job> {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    const queueName = this.generateQueueName(prefix, queueScaleFactor, scene);
    let queue = this.queues.get(queueName);

    if (!queue) {
      queue = this.initQueue(
        queueName,
        jobFn,
        {
          connection: this.connection,
          sharedConnection: true,
          ...queueOptions,
        },
        workerOptions
      );
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

  private generateQueueName(prefix: string, queueScaleFactor: number, scene?: string): string {
    let envSuffix;

    if (queueScaleFactor > 1) {
      queueScaleFactor = random(1, queueScaleFactor);
    }

    switch (appEnv.general.ENV) {
      case EnvType.Development:
        envSuffix = "dev";
        break;
      default:
        envSuffix = process.env.pm_id || "prod";
        break;
    }

    if (!scene) {
      return `${prefix}-${envSuffix}-${queueScaleFactor}`;
    }

    return `${prefix}-${envSuffix}-${scene}-${queueScaleFactor}`;
  }
}
