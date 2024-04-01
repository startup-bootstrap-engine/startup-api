import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { QUEUE_CHARACTER_MAX_SCALE_FACTOR } from "@providers/constants/QueueConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MultiQueue } from "@providers/queue/MultiQueue";

type CallbackRecord = () => void;

@provideSingleton(ItemUseCycleQueue)
export class ItemUseCycleQueue {
  public itemCallbacks = new Map<string, CallbackRecord>();

  constructor(private locker: Locker, private multiQueue: MultiQueue) {}

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
    const totalOnlineCharacters = await Character.countDocuments({ isOnline: true });

    const maxQueues = Math.ceil(totalOnlineCharacters / 10) || 1;
    const queueScaleFactor = Math.min(maxQueues, QUEUE_CHARACTER_MAX_SCALE_FACTOR);

    await this.multiQueue.addJob(
      "item-use-cycle",

      async (job) => {
        let { characterId, itemKey, iterations, intervalDurationMs } = job.data;

        const callback = this.itemCallbacks.get(`${characterId}-${itemKey}`);

        if (!callback) {
          return;
        }

        await callback();

        iterations--;

        if (iterations > 0) {
          await this.add(scene, characterId, itemKey, iterations, intervalDurationMs);
        }
      },
      {
        characterId,
        itemKey,
        iterations,
        intervalDurationMs,
      },
      queueScaleFactor,
      undefined,
      {
        delay: intervalDurationMs,
      }
    );
  }

  public async clearAllJobs(): Promise<void> {
    await this.multiQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.multiQueue.shutdown();
  }
}
