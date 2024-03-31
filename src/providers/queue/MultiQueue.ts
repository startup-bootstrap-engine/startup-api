import { appEnv } from "@providers/config/env";
import { QUEUE_DEFAULT_QUEUE_NUMBER } from "@providers/constants/QueueConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { EnvType } from "@rpg-engine/shared";
import { DefaultJobOptions, Job, Queue, QueueBaseOptions, Worker } from "bullmq";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

type QueueJobFn = (job: any) => Promise<void>;

@provideSingleton(MultiQueue)
export class MultiQueue {
  private connection: any;

  constructor(private redisManager: RedisManager, private queueActivityMonitor: QueueActivityMonitor) {}

  public async addJob(
    prefix: string,
    scene: string,
    jobFn: QueueJobFn,
    data: Record<string, unknown>,
    queueNumber: number = QUEUE_DEFAULT_QUEUE_NUMBER,
    addQueueOptions?: DefaultJobOptions,
    queueOptions?: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): Promise<Job> {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    const queueName = this.generateQueueName(prefix, scene, queueNumber);

    // Check if queue exists in centralized store (Redis) before initializing
    if (!(await this.queueActivityMonitor.hasQueueActivity(queueName))) {
      this.initQueue(queueName, jobFn, queueOptions, workerOptions);
    }

    const queue = new Queue(queueName, {
      connection: this.connection,
      sharedConnection: true,
      ...queueOptions,
    });

    return await queue.add(queueName, data, {
      removeOnComplete: true,
      removeOnFail: true,
      ...addQueueOptions,
    });
  }

  public async clearAllJobs(): Promise<void> {
    const allQueues = await this.queueActivityMonitor.getAllQueues();
    for (const queueName of allQueues) {
      const queue = new Queue(queueName, {
        connection: this.connection,
      });
      const jobs = await queue.getJobs(["waiting", "active", "delayed", "paused"]);
      for (const job of jobs) {
        await job
          .remove()
          .catch((err) => console.error(`Error removing job ${job.id} from queue ${queueName}:`, err.message));
      }
    }
  }

  public async shutdown(): Promise<void> {
    const allQueues = await this.queueActivityMonitor.getAllQueues();
    for (const queueName of allQueues) {
      const worker = new Worker(queueName, async () => {}, {
        connection: this.connection,
      });
      await worker
        .close()
        .catch((err) => console.error(`Error shutting down worker for queue ${queueName}:`, err.message));

      const queue = new Queue(queueName, {
        connection: this.connection,
      });
      await queue.close().catch((err) => console.error(`Error shutting down queue ${queueName}:`, err.message));

      await this.queueActivityMonitor.deleteQueueActivity(queueName);
    }
  }

  private initQueue(
    queueName: string,
    jobFn: QueueJobFn,
    queueOptions?: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): void {
    new Queue(queueName, {
      connection: this.connection,
      sharedConnection: true,
      ...queueOptions,
    });

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

    if (!appEnv.general.IS_UNIT_TEST) {
      worker.on("failed", (job, err) => {
        console.log(`${queueName} job ${job?.id} failed with error ${err.message}`);
      });
    }
  }

  private generateQueueName(prefix: string, scene: string, queueNumber: number): string {
    let envSuffix;

    switch (appEnv.general.ENV) {
      case EnvType.Development:
        envSuffix = "dev";
        break;
      default:
        envSuffix = process.env.pm_id || "prod";
        break;
    }

    return `${prefix}-${envSuffix}-${scene}-${queueNumber}`;
  }
}
