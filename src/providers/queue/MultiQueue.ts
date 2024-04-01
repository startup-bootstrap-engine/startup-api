import { appEnv } from "@providers/config/env";
import {
  QUEUE_CHARACTER_MAX_SCALE_FACTOR,
  QUEUE_NPC_MAX_SCALE_FACTOR,
  QueueDefaultScaleFactor,
} from "@providers/constants/QueueConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { EnvType } from "@rpg-engine/shared";
import { DefaultJobOptions, Job, Queue, QueueBaseOptions, Worker } from "bullmq";
import { random } from "lodash";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

type QueueJobFn = (job: any) => Promise<void>;

type AvailableScaleFactors = "custom" | "active-characters" | "active-npcs";

interface IQueueScaleOptions {
  queueScaleBy: AvailableScaleFactors;
  queueScaleFactor?: QueueDefaultScaleFactor;
  data?: {
    scene?: string;
  };
}

@provideSingleton(MultiQueue)
export class MultiQueue {
  private connection: any;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(
    private redisManager: RedisManager,
    private queueActivityMonitor: QueueActivityMonitor,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  public async addJob(
    prefix: string,
    jobFn: QueueJobFn,
    data: Record<string, unknown>,
    queueScaleOptions: IQueueScaleOptions = { queueScaleBy: "custom", queueScaleFactor: QueueDefaultScaleFactor.Low },
    addQueueOptions?: DefaultJobOptions,
    queueOptions?: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): Promise<Job> {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    const { queueScaleFactor, queueScaleBy } = queueScaleOptions;

    const queueName = await this.generateQueueName(prefix, queueScaleBy, queueScaleFactor);

    const queue = this.initOrFetchQueue(
      queueName,
      jobFn,
      {
        connection: this.connection,
        sharedConnection: true,
        ...queueOptions,
      },
      workerOptions
    );

    return await queue.add(queueName, data, {
      removeOnComplete: true,
      removeOnFail: true,
      ...addQueueOptions,
    });
  }

  private initOrFetchQueue(
    queueName: string,
    jobFn: QueueJobFn,
    queueOptions: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): Queue {
    let queue = this.queues.get(queueName);

    if (!queue) {
      console.log(`💡 Initializing queue ${queueName}`);
      queue = new Queue(queueName, queueOptions);
      this.queues.set(queueName, queue);
    }

    let worker = this.workers.get(queueName);

    if (!worker) {
      worker = new Worker(
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
        worker.on("failed", async (job, err) => {
          console.log(`${queueName} job ${job?.id} failed with error ${err.message}`);

          await worker?.close();
        });
      }
      this.workers.set(queueName, worker);
    }

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

  private async generateQueueName(
    prefix: string,
    queueScaleBy: AvailableScaleFactors,
    queueScaleFactor?: number
  ): Promise<string> {
    let envSuffix;

    switch (appEnv.general.ENV) {
      case EnvType.Development:
        envSuffix = "dev";
        break;
      default:
        envSuffix = process.env.pm_id || "prod";
        break;
    }

    switch (queueScaleBy) {
      case "custom":
        if (!queueScaleFactor) {
          throw new Error("Queue scale factor is required when scaling by custom");
        }

        if (queueScaleFactor > 1) {
          queueScaleFactor = random(1, queueScaleFactor);
        }

        return `${prefix}-${envSuffix}-${queueScaleFactor}`;

      case "active-characters":
        const activeCharacters = Number((await this.inMemoryHashTable.get("activity-tracker", "character-count")) || 1);

        const maxCharQueues = Math.ceil(activeCharacters / 10) || 1;
        const charQueueScaleFactor = Math.min(maxCharQueues, QUEUE_CHARACTER_MAX_SCALE_FACTOR);

        return `${prefix}-${envSuffix}-${charQueueScaleFactor}`;

      case "active-npcs":
        const activeNPCs = Number((await this.inMemoryHashTable.get("activity-tracker", "npc-count")) || 1);

        const maxNPCQueues = Math.ceil(activeNPCs / 10) || 1;
        const NPCQueueScaleFactor = Math.min(maxNPCQueues, QUEUE_NPC_MAX_SCALE_FACTOR);

        return `${prefix}-${envSuffix}-${NPCQueueScaleFactor}`;
    }
  }
}
