import { NewRelic } from "@providers/analytics/NewRelic";
import { appEnv } from "@providers/config/env";
import {
  QUEUE_CHARACTER_MAX_SCALE_FACTOR,
  QUEUE_CONNECTION_CHECK_INTERVAL,
  QUEUE_GLOBAL_WORKER_LIMITER_DURATION,
  QUEUE_NPC_MAX_SCALE_FACTOR,
  QUEUE_WORKER_MIN_CONCURRENCY,
  QUEUE_WORKER_MIN_JOB_RATE,
  QueueDefaultScaleFactor,
} from "@providers/constants/QueueConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { EnvType } from "@rpg-engine/shared";
import { DefaultJobOptions, Job, Queue, QueueBaseOptions, Worker, WorkerOptions } from "bullmq";
import { Redis } from "ioredis";
import { random } from "lodash";
import { EntityQueueScalingCalculator } from "./EntityQueueScalingCalculator";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

type QueueJobFn = (job: any) => Promise<void>;

type AvailableScaleFactors = "single" | "custom" | "active-characters" | "active-npcs";

interface IQueueScaleOptions {
  queueScaleBy: AvailableScaleFactors;
  queueScaleFactor?: QueueDefaultScaleFactor;
  data?: {
    scene?: string;
  };
  forceCustomScale?: number;
}

@provideSingleton(DynamicQueue)
export class DynamicQueue {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueConnections: Map<string, any> = new Map();

  constructor(
    private redisManager: RedisManager,
    private queueActivityMonitor: QueueActivityMonitor,
    private inMemoryHashTable: InMemoryHashTable,
    private newRelic: NewRelic,
    private entityQueueScalingCalculator: EntityQueueScalingCalculator
  ) {}

  public async addJob(
    prefix: string,
    jobFn: QueueJobFn,
    data: Record<string, unknown>,
    queueScaleOptions: IQueueScaleOptions = { queueScaleBy: "single" },
    addQueueOptions?: DefaultJobOptions,
    queueOptions?: QueueBaseOptions,
    workerOptions?: QueueBaseOptions
  ): Promise<Job | undefined> {
    try {
      const { queueScaleFactor, queueScaleBy } = queueScaleOptions;

      const queueName = await this.generateQueueName(prefix, queueScaleBy, queueScaleFactor, queueScaleOptions);

      const connection = await this.getQueueConnection(queueName);

      const queue = await this.initOrFetchQueue(
        queueName,
        jobFn,
        connection,
        {
          connection,
          ...queueOptions,
        },
        workerOptions,
        queueScaleOptions
      );

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Server,
        `QueueExecution/${prefix}`,
        1
      );

      return await queue.add(queueName, data, {
        removeOnComplete: true,
        removeOnFail: true,
        ...addQueueOptions,
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async getQueueConnection(queueName: string): Promise<Redis> {
    let connection = this.queueConnections.get(queueName);
    if (connection) {
      return connection;
    } else {
      connection = await this.redisManager.getPoolClient(queueName);
      this.queueConnections.set(queueName, connection);
    }
    return connection;
  }

  private async initOrFetchQueue(
    queueName: string,
    jobFn: QueueJobFn,
    connection: Redis,
    queueOptions: QueueBaseOptions,
    workerOptions?: QueueBaseOptions,
    queueScaleOptions?: IQueueScaleOptions
  ): Promise<Queue> {
    let queue = this.queues.get(queueName);

    if (!queue) {
      console.log(`💡💡💡 Initializing queue ${queueName} 💡💡💡`);
      queue = new Queue(queueName, queueOptions);
      this.queues.set(queueName, queue);
      // constantly pool the connection to check if it's still needed
      this.monitorAndReleaseInactiveQueueRedisConnections(queueName, connection);

      queue.on("error", (error) => {
        console.error(`Queue error: ${error.message}`);
      });
    }

    await this.initOrFetchWorker(queueName, jobFn, connection, workerOptions, queueScaleOptions);

    return queue;
  }

  private async initOrFetchWorker(
    queueName: string,
    jobFn: QueueJobFn,
    connection: Redis,
    workerOptions?: WorkerOptions,
    queueScaleOptions?: IQueueScaleOptions
  ): Promise<void> {
    let worker = this.workers.get(queueName);

    let maxWorkerLimiter = QUEUE_WORKER_MIN_JOB_RATE;
    let maxWorkerConcurrency = QUEUE_WORKER_MIN_CONCURRENCY;

    switch (queueScaleOptions?.queueScaleBy) {
      case "active-characters":
        const activeCharacterCount = Number(
          (await this.inMemoryHashTable.get("activity-tracker", "character-count")) || 1
        );

        maxWorkerLimiter = this.entityQueueScalingCalculator.calculateMaxLimiter(activeCharacterCount);

        maxWorkerConcurrency = this.entityQueueScalingCalculator.calculateConcurrency(activeCharacterCount);

        break;
      case "active-npcs":
        const activeNPCsCount = Number((await this.inMemoryHashTable.get("activity-tracker", "npc-count")) || 1);
        maxWorkerLimiter = this.entityQueueScalingCalculator.calculateMaxLimiter(activeNPCsCount);
        maxWorkerConcurrency = this.entityQueueScalingCalculator.calculateConcurrency(activeNPCsCount);
        break;
    }

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
          name: `${queueName}-worker`,
          concurrency: maxWorkerConcurrency,
          limiter: {
            max: maxWorkerLimiter,
            duration: QUEUE_GLOBAL_WORKER_LIMITER_DURATION,
          },
          connection,
          ...workerOptions,
        }
      );
      this.workers.set(queueName, worker);

      if (!appEnv.general.IS_UNIT_TEST) {
        worker.on("failed", async (job, err) => {
          console.log(`${queueName} job ${job?.id} failed with error ${err.message}`);
          await worker?.close();
        });
      }
    }
  }

  // Remember each redis client connection consume resources, so it's important to release them when they're no longer needed
  private monitorAndReleaseInactiveQueueRedisConnections(queueName: string, connection: any): void {
    this.queueConnections.set(queueName, connection);

    const queueConnectionInterval = setInterval(
      async () => {
        const hasQueueActivity = await this.queueActivityMonitor.hasQueueActivity(queueName);

        if (!hasQueueActivity) {
          console.log(`🔒 Releasing connection for queue ${queueName}`);

          const connection = this.queueConnections.get(queueName);

          if (!connection) {
            console.error(`Error releasing connection for queue ${queueName}: Connection not found`);
            clearInterval(queueConnectionInterval);
            return;
          }

          await this.redisManager.releasePoolClient(connection);
          this.queueConnections.delete(queueName);

          const queue = this.queues.get(queueName);
          const worker = this.workers.get(queueName);

          if (queue || worker) {
            console.log(`🔒 Releasing connection for queue ${queueName}`);
          }

          await worker?.close(); // Close the worker
          await queue?.close(); // Close the queue
          await queue?.obliterate({ force: true }); // Remove the queue and its data from Redis

          this.queues.delete(queueName); // Remove the queue from the queues map as well, since we dont have a connection anymore (this will force a new queue creation on the next job)
          this.workers.delete(queueName); // Remove the worker from the workers map as well!
          clearInterval(queueConnectionInterval);
        }
      },

      QUEUE_CONNECTION_CHECK_INTERVAL
    );
  }

  private async generateQueueName(
    prefix: string,
    queueScaleBy: AvailableScaleFactors,
    queueScaleFactor?: number,
    queueScaleOptions?: IQueueScaleOptions
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
      case "single":
        return `${prefix}-${envSuffix}`;

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

        const maxCharQueues = Math.ceil(activeCharacters / 20) || 1;
        const charQueueScaleFactor = Math.min(
          maxCharQueues,
          queueScaleOptions?.forceCustomScale || QUEUE_CHARACTER_MAX_SCALE_FACTOR
        );

        return `${prefix}-${envSuffix}-${charQueueScaleFactor}`;

      case "active-npcs":
        const activeNPCs = Number((await this.inMemoryHashTable.get("activity-tracker", "npc-count")) || 1);

        const maxNPCQueues = Math.ceil(activeNPCs / 15) || 1;

        const NPCQueueScaleFactor = Math.min(
          maxNPCQueues,
          queueScaleOptions?.forceCustomScale || QUEUE_NPC_MAX_SCALE_FACTOR
        );
        return `${prefix}-${envSuffix}-${NPCQueueScaleFactor}`;
    }
  }

  // Moved down here for readability

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
}
