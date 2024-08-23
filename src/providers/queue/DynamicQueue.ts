/* eslint-disable promise/param-names */
import { NewRelic } from "@providers/analytics/NewRelic";
import { appEnv } from "@providers/config/env";
import {
  QUEUE_CHARACTER_DEFAULT_SCALE_FACTOR,
  QUEUE_NPC_DEFAULT_SCALE_FACTOR,
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
import { hostname } from "os";
import { DynamicQueueCleaner } from "./DynamicQueueCleaner";
import { EntityQueueScalingCalculator } from "./EntityQueueScalingCalculator";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

type QueueJobFn = ((job: Job) => Promise<void>) | ((job: Job) => Promise<boolean>) | ((job: Job) => void);

type AvailableScaleFactors = "single" | "custom" | "active-characters" | "active-npcs";

interface IQueueScaleOptions {
  queueScaleBy: AvailableScaleFactors;
  queueScaleFactor?: QueueDefaultScaleFactor;
  hasConcurrency?: boolean;
  data?: {
    scene?: string;
  };
  stickToOrigin?: boolean;
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
    let queueName;

    try {
      const { queueScaleFactor, queueScaleBy } = queueScaleOptions;
      queueName = await this.generateQueueName(prefix, queueScaleBy, queueScaleFactor, queueScaleOptions);

      const connection = (await this.getQueueConnection(queueName)) as any;
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

      return await queue?.add(queueName, data, {
        ...addQueueOptions,
        removeOnComplete: true,
        removeOnFail: true,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async initOrFetchWorker(
    queueName: string,
    jobFn: QueueJobFn,
    connection: any,
    workerOptions?: WorkerOptions,
    queueScaleOptions?: IQueueScaleOptions
  ): Promise<void> {
    if (this.workers.has(queueName)) return;

    const { maxWorkerConcurrency, maxWorkerLimiter } = await this.getWorkerScalingParameters(queueScaleOptions);

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      NewRelicSubCategory.Server,
      `WorkerConcurrency/${queueName}`,
      maxWorkerConcurrency
    );

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      NewRelicSubCategory.Server,
      `WorkerLimiter/${queueName}`,
      maxWorkerLimiter
    );

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      NewRelicSubCategory.Server,
      `WorkerPoolSize/${queueName}`,
      this.workers.size
    );

    const worker = new Worker(
      queueName,
      async (job) => {
        try {
          await this.queueActivityMonitor.updateQueueActivity(queueName);

          const result = await this.processJobWithTimeout(job, jobFn, 7500);

          return result;
        } catch (error) {
          console.error(`${queueName}: Error processing job ${job.id}:`, error);
          throw error; // Let BullMQ handle the job failure
        }
      },
      {
        name: `${queueName}-worker`,
        concurrency: queueScaleOptions?.hasConcurrency ? maxWorkerConcurrency : 1,
        connection,
        ...workerOptions,
      }
    );

    this.workers.set(queueName, worker);

    if (!appEnv.general.IS_UNIT_TEST) {
      this.setupWorkerErrorHandlers(worker, queueName);
    }
  }

  private processJobWithTimeout = (job: Job, jobFn: Function, timeoutDuration: number = 7500): Promise<any> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      let timeoutReached = false;

      // Set a timeout to reject the promise if the job takes too long
      const timeout = setTimeout(() => {
        timeoutReached = true;
        console.error(`Job ${job.id} timed out after ${timeoutDuration}ms`);
        // Optionally, attempt to kill or stop the job function here if possible
        reject(new Error("TimeoutError"));
      }, timeoutDuration);

      try {
        // Execute the job function and monitor the execution
        const result = await jobFn(job);

        // Clear the timeout if the job completes within the specified duration
        if (!timeoutReached) {
          clearTimeout(timeout);
          resolve(result);
        }
      } catch (error) {
        // Ensure timeout is cleared in case of error
        if (!timeoutReached) {
          clearTimeout(timeout);
          reject(error);
        } else {
          console.error(`Job ${job.id} failed after timing out: ${error.message}`);
        }
      }
    });
  };

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
    const envSuffix = appEnv.general.ENV === EnvType.Development ? "dev" : "prod";

    if (queueScaleOptions?.stickToOrigin) {
      const machineId = this.getMachineId(); // Implement this method to get a unique machine identifier
      return `${prefix}-${envSuffix}-${machineId}`;
    }

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
          QUEUE_CHARACTER_DEFAULT_SCALE_FACTOR
        );
      case "active-npcs":
        return await this.generateDynamicQueueName(prefix, envSuffix, "npc-count", QUEUE_NPC_DEFAULT_SCALE_FACTOR);
      default:
        throw new Error("Invalid queueScaleBy value");
    }
  }

  private async generateDynamicQueueName(
    prefix: string,
    envSuffix: string,
    entityKey: string,
    defaultScaleFactor?: number
  ): Promise<string> {
    // Combine fetching and default assignment
    const entityCount = Number(await this.inMemoryHashTable.get("activity-tracker", entityKey)) || 1;
    const maxQueues = Math.max(1, Math.ceil(entityCount / 10)); // Use Math.max to ensure at least one queue

    // Simplified scale factor calculation
    const scaleFactor = Math.min(maxQueues, defaultScaleFactor ?? 1);

    if (scaleFactor < 0) {
      throw new Error("Invalid scale factor calculated. Ensure entity count and scale factors are correct.");
    }

    const factor = random(0, scaleFactor);

    return this.buildQueueName(prefix, envSuffix, factor);
  }

  private buildQueueName(prefix: string, envSuffix: string, factor?: number): string {
    return `${prefix}-${envSuffix}${factor !== undefined ? `-${factor}` : ""}`;
  }

  private getMachineId(): string {
    const nodeHostname = hostname();
    const pm2Id = process.env.pm_id || "0";
    return `${nodeHostname}-${pm2Id}`;
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueueCleaner.clearAllJobs(this.queues);
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueueCleaner.shutdown(this.queues, this.workers);
  }
}
