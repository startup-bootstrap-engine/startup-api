import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { EnvType } from "@rpg-engine/shared";
import { DefaultJobOptions, Queue, QueueBaseOptions, Worker } from "bullmq";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

type QueueJobFn = (job: any) => Promise<void>;

@provideSingleton(MultiQueue)
export class MultiQueue {
  constructor(private redisManager: RedisManager, private queueActivityMonitor: QueueActivityMonitor) {
    setInterval(async () => {
      const allQueues = await this.queueActivityMonitor.getAllQueues();

      console.log(allQueues);
    }, 3000);
  }

  public async addJob(
    prefix: string,
    scene: string,
    jobFn: QueueJobFn,
    data: Record<string, unknown>,
    queueNumber: number,
    addQueueOptions?: DefaultJobOptions,
    queueOptions?: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): Promise<void> {
    const queueName = this.generateQueueName(prefix, scene, queueNumber);

    // Check if queue exists in centralized store (Redis) before initializing
    if (!(await this.queueActivityMonitor.hasQueueActivity(queueName))) {
      this.initQueue(queueName, jobFn, queueOptions, workerOptions);
    }

    const queue = new Queue(queueName, {
      connection: this.redisManager.client,
      sharedConnection: true,
      ...queueOptions,
    });

    await queue.add(queueName, data, {
      removeOnComplete: true,
      removeOnFail: true,
      ...addQueueOptions,
    });
  }

  public async clearAllJobs(): Promise<void> {
    const allQueues = await this.queueActivityMonitor.getAllQueues();
    for (const queueName of allQueues) {
      const queue = new Queue(queueName, {
        connection: this.redisManager.client,
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
        connection: this.redisManager.client,
      });
      await worker
        .close()
        .catch((err) => console.error(`Error shutting down worker for queue ${queueName}:`, err.message));

      const queue = new Queue(queueName, {
        connection: this.redisManager.client,
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
      connection: this.redisManager.client,
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
        connection: this.redisManager.client,
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
