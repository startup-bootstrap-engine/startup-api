/* eslint-disable promise/param-names */
import { NewRelic } from "@providers/analytics/NewRelic";
import { appEnv } from "@providers/config/env";
import {
  QUEUE_CHARACTER_MAX_SCALE_FACTOR,
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
import { DynamicQueueCleaner } from "./DynamicQueueCleaner";
import { EntityQueueScalingCalculator } from "./EntityQueueScalingCalculator";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

type QueueJobFn = ((job: Job) => Promise<void>) | ((job: Job) => Promise<boolean>);

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
  private queueConnections: Map<string, Redis> = new Map();

  constructor(
    private redisManager: RedisManager,
    private queueActivityMonitor: QueueActivityMonitor,
    private inMemoryHashTable: InMemoryHashTable,
    private newRelic: NewRelic,
    private entityQueueScalingCalculator: EntityQueueScalingCalculator,
    private dynamicQueueCleaner: DynamicQueueCleaner
  ) {}

  public async addJob(
    prefix: string,
    jobFn: QueueJobFn,
    data: Record<string, unknown>,
    queueScaleOptions: IQueueScaleOptions = { queueScaleBy: "single" },
    addQueueOptions?: DefaultJobOptions,
    queueOptions?: QueueBaseOptions,
    workerOptions?: WorkerOptions
  ): Promise<Job | undefined> {
    try {
      const { queueScaleFactor, queueScaleBy } = queueScaleOptions;
      const queueName = await this.generateQueueName(prefix, queueScaleBy, queueScaleFactor, queueScaleOptions);
      const connection = await this.getQueueConnection(queueName);
      const queue = await this.initOrFetchQueue(
        queueName,
        jobFn,
        connection,
        { connection, ...queueOptions },
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
        ...addQueueOptions,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: "exponential", delay: 500 },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async getQueueConnection(queueName: string): Promise<Redis> {
    if (!this.queueConnections.has(queueName)) {
      const connection = await this.redisManager.getPoolClient(queueName);
      this.queueConnections.set(queueName, connection);
    }
    return this.queueConnections.get(queueName)!;
  }

  private async initOrFetchQueue(
    queueName: string,
    jobFn: QueueJobFn,
    connection: Redis,
    queueOptions: QueueBaseOptions,
    workerOptions?: QueueBaseOptions,
    queueScaleOptions?: IQueueScaleOptions
  ): Promise<Queue> {
    if (!this.queues.has(queueName)) {
      console.log(`💡💡💡 Initializing queue ${queueName} 💡💡💡`);
      const queue = new Queue(queueName, queueOptions);
      this.queues.set(queueName, queue);
      queue.on("error", (error) => console.error(`Queue error: ${error.message}`));

      await this.dynamicQueueCleaner.monitorAndReleaseInactiveQueueRedisConnections(
        this.queues,
        this.workers,
        this.queueConnections,
        queueName,
        connection
      );

      await this.initOrFetchWorker(queueName, jobFn, connection, workerOptions, queueScaleOptions);
    }

    return this.queues.get(queueName)!;
  }

  private async initOrFetchWorker(
    queueName: string,
    jobFn: QueueJobFn,
    connection: Redis,
    workerOptions?: WorkerOptions,
    queueScaleOptions?: IQueueScaleOptions
  ): Promise<void> {
    if (this.workers.has(queueName)) return;

    const { maxWorkerLimiter, maxWorkerConcurrency } = await this.getWorkerScalingParameters(queueScaleOptions);

    const worker = new Worker(
      queueName,
      async (job) => {
        const jobTimeout = 30000; // 30 seconds timeout

        let timeoutHandle: NodeJS.Timeout | undefined;

        const timeoutPromise = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error("Job timeout")), jobTimeout);
        });

        try {
          await this.queueActivityMonitor.updateQueueActivity(queueName);
          await Promise.race([jobFn(job), timeoutPromise]);
          if (timeoutHandle) {
            clearTimeout(timeoutHandle); // Clear the timeout if the job completes in time
          }
        } catch (error) {
          console.error(`${queueName}: Error processing job ${job.id}:`, error);
          if (timeoutHandle) {
            clearTimeout(timeoutHandle); // Clear the timeout if the job fails
          }
          throw error; // Let BullMQ handle the job failure
        }
      },
      {
        name: `${queueName}-worker`,
        concurrency: maxWorkerConcurrency,
        limiter: { max: maxWorkerLimiter, duration: QUEUE_GLOBAL_WORKER_LIMITER_DURATION },
        removeOnComplete: { age: 86400, count: 1000 },
        removeOnFail: { age: 86400, count: 1000 },
        connection,
        ...workerOptions,
      }
    );

    this.workers.set(queueName, worker);

    if (!appEnv.general.IS_UNIT_TEST) {
      this.setupWorkerErrorHandlers(worker, queueName);
    }
  }

  private async getWorkerScalingParameters(
    queueScaleOptions?: IQueueScaleOptions
  ): Promise<{ maxWorkerLimiter: number; maxWorkerConcurrency: number }> {
    let maxWorkerLimiter = QUEUE_WORKER_MIN_JOB_RATE;
    let maxWorkerConcurrency = QUEUE_WORKER_MIN_CONCURRENCY;

    if (!queueScaleOptions) return { maxWorkerLimiter, maxWorkerConcurrency };

    const { queueScaleBy } = queueScaleOptions;
    const activeCount = await this.getActiveEntityCount(queueScaleBy);

    if (queueScaleBy === "active-characters" || queueScaleBy === "active-npcs") {
      maxWorkerLimiter = this.entityQueueScalingCalculator.calculateMaxLimiter(activeCount);
      maxWorkerConcurrency = this.entityQueueScalingCalculator.calculateConcurrency(activeCount);
    }

    return { maxWorkerLimiter, maxWorkerConcurrency };
  }

  private async getActiveEntityCount(queueScaleBy: AvailableScaleFactors): Promise<number> {
    if (queueScaleBy === "active-characters") {
      return Number((await this.inMemoryHashTable.get("activity-tracker", "character-count")) || 1);
    }
    if (queueScaleBy === "active-npcs") {
      return Number((await this.inMemoryHashTable.get("activity-tracker", "npc-count")) || 1);
    }
    return 1;
  }

  private setupWorkerErrorHandlers(worker: Worker, queueName: string): void {
    worker.on("error", (error) => console.error(`Worker error: ${error.message}`, error));
    worker.on("failed", (job, error) =>
      console.error(
        `${queueName} - Job ${job?.id} failed with error: ${error.message} - data: ${JSON.stringify(job?.data)}`
      )
    );
  }

  private async generateQueueName(
    prefix: string,
    queueScaleBy: AvailableScaleFactors,
    queueScaleFactor?: number,
    queueScaleOptions?: IQueueScaleOptions
  ): Promise<string> {
    const envSuffix = appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id || "prod";

    switch (queueScaleBy) {
      case "single":
        return prefix;
      case "custom":
        if (!queueScaleFactor) throw new Error("Queue scale factor is required when scaling by custom");
        return this.buildQueueName(prefix, envSuffix, random(1, queueScaleFactor));
      case "active-characters":
        return await this.generateDynamicQueueName(
          prefix,
          envSuffix,
          "character-count",
          queueScaleOptions,
          QUEUE_CHARACTER_MAX_SCALE_FACTOR
        );
      case "active-npcs":
        return await this.generateDynamicQueueName(
          prefix,
          envSuffix,
          "npc-count",
          queueScaleOptions,
          QUEUE_NPC_MAX_SCALE_FACTOR
        );
      default:
        throw new Error("Invalid queueScaleBy value");
    }
  }

  private async generateDynamicQueueName(
    prefix: string,
    envSuffix: string,
    entityKey: string,
    queueScaleOptions?: IQueueScaleOptions,
    defaultScaleFactor?: number
  ): Promise<string> {
    const entityCount = Number((await this.inMemoryHashTable.get("activity-tracker", entityKey)) || 1);
    const maxQueues = Math.ceil(entityCount / 35) || 1;
    const scaleFactor = Math.min(maxQueues, queueScaleOptions?.forceCustomScale! || defaultScaleFactor!);
    return this.buildQueueName(prefix, envSuffix, random(0, scaleFactor - 1));
  }

  private buildQueueName(prefix: string, envSuffix: string, factor?: number): string {
    return `${prefix}-${envSuffix}${factor !== undefined ? `-${factor}` : ""}`;
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueueCleaner.clearAllJobs(this.queues);
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueueCleaner.shutdown(this.queues, this.workers);
  }
}
