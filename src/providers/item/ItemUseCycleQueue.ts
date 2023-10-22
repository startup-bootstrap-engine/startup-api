import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { EnvType } from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import { v4 as uuidv4 } from "uuid";

type CallbackRecord = () => void;

@provideSingleton(ItemUseCycleQueue)
export class ItemUseCycleQueue {
  public itemCallbacks = new Map<string, CallbackRecord>();
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private connection: any;

  private queueName: string = `item-use-cycle-${uuidv4()}-${
    appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id
  }`;

  constructor(private redisManager: RedisManager) {}

  public async init(): Promise<void> {
    this.connection = this.redisManager.client;

    await this.shutdown();

    this.queue = new Queue(this.queueName, {
      connection: this.connection,
    });

    this.worker = new Worker(
      this.queueName,
      async (job) => {
        let { characterId, itemKey, iterations, intervalDurationMs } = job.data;

        try {
          const callback = this.itemCallbacks.get(`${characterId}-${itemKey}`);

          if (!callback) {
            return;
          }

          await callback();

          iterations--;

          if (iterations > 0) {
            await this.add(characterId, itemKey, iterations, intervalDurationMs);
          }
        } catch (err) {
          console.error("Error processing item-use-cycle queue", err);
          throw err;
        }
      },
      {
        connection: this.connection,
      }
    );

    if (!appEnv.general.IS_UNIT_TEST) {
      this.worker.on("failed", async (job, err) => {
        console.log(`ItemUseCycle job ${job?.id} failed with error ${err.message}`);

        await this.worker?.close();
        this.worker = null;
      });

      this.queue.on("error", async (error) => {
        console.error("Error in the ItemUseCycleQueue:", error);

        await this.queue?.close();
        this.queue = null;
      });
    }
  }

  public async clearAllJobs(): Promise<void> {
    if (!this.connection || !this.queue || !this.worker) {
      await this.init();
    }

    const jobs = (await this.queue?.getJobs(["waiting", "active", "delayed", "paused"])) ?? [];
    for (const job of jobs) {
      try {
        await job?.remove();
      } catch (err) {
        console.error(`Error removing job ${job?.id}:`, err.message);
      }
    }
  }

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();

    this.queue = null;
    this.worker = null;
  }

  @TrackNewRelicTransaction()
  public async start(
    characterId: string,
    itemKey: string,
    iterations: number,
    intervalDurationMs: number,
    callback: CallbackRecord
  ): Promise<void> {
    this.itemCallbacks.set(`${characterId}-${itemKey}`, callback);

    // execute first callback
    await callback();

    await this.add(characterId, itemKey, iterations, intervalDurationMs);
  }

  private async add(
    characterId: string,
    itemKey: string,
    iterations: number,
    intervalDurationMs: number
  ): Promise<void> {
    if (!this.connection || !this.queue || !this.worker) {
      await this.init();
    }

    await this.queue?.add(
      this.queueName,
      {
        characterId,
        itemKey,
        iterations,
        intervalDurationMs,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        delay: intervalDurationMs,
      }
    );
  }
}
