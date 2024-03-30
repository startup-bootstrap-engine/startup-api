import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { EnvType } from "@rpg-engine/shared";
import { DefaultJobOptions, Queue, QueueBaseOptions, Worker } from "bullmq";
import { provide } from "inversify-binding-decorators";
import { QueueCleaner } from "./QueueCleaner";

type QueueJobFn = (job: any) => Promise<void>;

@provide(QueueSceneBased)
export class QueueSceneBased {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;

  constructor(private redisManager: RedisManager, private queueCleaner: QueueCleaner) {}

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

    if (!this.connection || !this.queue || !this.worker) {
      this.initQueue(
        queueName,
        jobFn,

        queueOptions,
        workerOptions
      );
    }

    await this.queue?.add(queueName, data, {
      removeOnComplete: true,
      removeOnFail: true,
      ...addQueueOptions,
    });
  }

  public async clearAllJobs(): Promise<void> {
    const jobs = (await this.queue?.getJobs(["waiting", "active", "delayed", "paused"])) ?? [];
    for (const job of jobs) {
      await job.remove().catch((err) => console.error(`Error removing job ${job.id}:`, err.message));
    }
  }

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();
    this.queue = null;
    this.worker = null;
  }

  private initQueue(
    queueName: string,
    jobFn: QueueJobFn,
    queueOptions?: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): void {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue(queueName, {
        connection: this.connection,
        sharedConnection: true,
        ...queueOptions,
      });
    }

    if (!this.worker) {
      this.worker = new Worker(
        queueName,
        async (job) => {
          await this.queueCleaner.updateQueueActivity(queueName);

          await jobFn(job);
        },
        {
          connection: this.connection,
          sharedConnection: true,
          ...workerOptions,
        }
      );
    }
  }

  private generateQueueName(prefix: string, scene: string, queueNumber: number): string {
    let envSuffix;

    switch (appEnv.general.ENV) {
      case EnvType.Development:
        envSuffix = "dev";
        break;
      default:
        envSuffix = process.env.pm_id;
        break;
    }

    return `${prefix}-${envSuffix}-${scene}-${queueNumber}`;
  }
}
