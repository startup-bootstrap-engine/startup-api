import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { DynamicQueue } from "@providers/queue/DynamicQueue";

type CallbackRecord = () => void;

@provideSingleton(ItemUseCycleQueue)
export class ItemUseCycleQueue {
  public itemCallbacks = new Map<string, CallbackRecord>();

  constructor(private locker: Locker, private dynamicQueue: DynamicQueue) {}

  @TrackNewRelicTransaction()
  public async start(
    scene: string,
    characterId: string,
    itemKey: string,
    iterations: number,
    intervalDurationMs: number,
    callback: CallbackRecord
  ): Promise<void> {
    try {
      const isLocked = await this.locker.lock(`item-use-cycle-${characterId}-${itemKey}`);

      if (!isLocked) {
        return;
      }

      this.itemCallbacks.set(`${characterId}-${itemKey}`, callback);

      // execute first callback
      await callback();

      await this.add(scene, characterId, itemKey, iterations, intervalDurationMs);
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`item-use-cycle-${characterId}-${itemKey}`);
    }
  }

  private async add(
    scene: string,
    characterId: string,
    itemKey: string,
    iterations: number,
    intervalDurationMs: number
  ): Promise<void> {
    await this.dynamicQueue.addJob(
      "item-use-cycle",

      async (job) => {
        let { characterId, itemKey, iterations, intervalDurationMs } = job.data;

        console.log("ItemUseCycleQueue.addJob", characterId, itemKey, iterations, intervalDurationMs);

        const callback = this.itemCallbacks.get(`${characterId}-${itemKey}`);

        console.log("Callback: ", callback);

        if (!callback) {
          console.log("Callback not found");
          return;
        }

        await callback();

        iterations--;

        if (iterations > 0) {
          return await this.add(scene, characterId, itemKey, iterations, intervalDurationMs);
        }
      },
      {
        characterId,
        itemKey,
        iterations,
        intervalDurationMs,
      },
      {
        queueScaleBy: "single",
        stickToOrigin: true,
      },

      {
        delay: intervalDurationMs,
      }
    );
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }
}
