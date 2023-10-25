import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { Locker } from "@providers/locks/Locker";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { EnvType } from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import { provide } from "inversify-binding-decorators";

// uniqueId
import { v4 as uuidv4 } from "uuid";
import { CharacterMonitorCallback, CharacterMonitorCallbacks } from "./CharacterMonitorQueue/CharacterMonitorCallback";

@provide(CharacterMonitorQueue)
export class CharacterMonitorQueue {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection;
  private queueName: string;

  constructor(
    private newRelic: NewRelic,
    private locker: Locker,
    private redisManager: RedisManager,
    private characterMonitorCallback: CharacterMonitorCallbacks
  ) {}

  public init(character: ICharacter): void {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queueName = `character-${character._id}-monitor-queue-${uuidv4()}-${
        appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id
      }`;

      this.queue = new Queue(this.queueName, {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.queue.on("error", async (error) => {
          console.error(`Error in ${this.queueName}`, error);

          await this.queue?.close();
        });
      }
    }

    if (!this.worker) {
      this.worker = new Worker(
        this.queueName,
        async (job) => {
          const { character, callbackId, intervalMs } = job.data;

          if (!character.isOnline) {
            await this.unwatch(callbackId, character);

            return;
          }

          try {
            await this.newRelic.trackMetric(
              NewRelicMetricCategory.Count,
              NewRelicSubCategory.Characters,
              "CharacterMonitor",
              1
            );

            await this.execMonitorCallback(character, callbackId, intervalMs);
          } catch (err) {
            await this.locker.unlock(`character-monitor-queue-${character._id}-callback-${callbackId}`);
            console.error("Error processing character monitor queue", err);
            throw err;
          }
        },
        {
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.log(`${this.queueName} job ${job?.id} failed with error ${err.message}`);

          await this.worker?.close();
        });
      }
    }
  }

  @TrackNewRelicTransaction()
  public async watch(
    callbackId: string,
    character: ICharacter,
    callback: CharacterMonitorCallback,
    intervalMs: number = 7000
  ): Promise<void> {
    if (!this.connection || !this.queue || !this.worker) {
      this.init(character);
    }

    try {
      const canProceed = await this.locker.lock(`character-monitor-queue-${character._id}-callback-${callbackId}`);

      const hasCallback = this.characterMonitorCallback.getCallback(character)?.[callbackId];

      if (!hasCallback) {
        await this.locker.unlock(`character-monitor-queue-${character._id}-callback-${callbackId}`);
      }

      if (!canProceed && hasCallback) {
        return;
      }

      const isWatching = this.isWatching(callbackId, character);

      if (isWatching) {
        return;
      }

      this.characterMonitorCallback.setCallback(character, callbackId, callback);

      if (intervalMs < 3000) {
        intervalMs = 3000;
      }

      await this.add(character, callbackId, intervalMs);
    } catch (error) {
      console.error(error);
      await this.unwatch(callbackId, character);
    }
  }

  public isWatching(callbackId: string, character: ICharacter): boolean {
    const currentCallbackRecord = this.characterMonitorCallback.getCallback(character);

    const hasCallback = currentCallbackRecord?.[callbackId];

    return !!hasCallback;
  }

  @TrackNewRelicTransaction()
  public async unwatch(callbackId: string, character: ICharacter): Promise<void> {
    try {
      this.characterMonitorCallback.deleteCallback(character, callbackId);

      await this.shutdown();
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`character-monitor-queue-${character._id}-callback-${callbackId}`);
    }
  }

  public async unwatchAll(character: ICharacter): Promise<void> {
    const callbackIds = this.characterMonitorCallback.getCallbackIds(character);

    // unlock all callbacks
    for (const callbackId of callbackIds) {
      await this.locker.unlock(`character-monitor-queue-${character._id}-callback-${callbackId}`);
    }

    this.characterMonitorCallback.deleteAllCallbacksFromCharacter(character);
  }

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();
    this.queue = null;
    this.worker = null;
  }

  private async add(character: ICharacter, callbackId: string, intervalMs: number): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execMonitorCallback(character, callbackId, intervalMs);
      return;
    }

    if (!this.queue) {
      this.init(character);
    }

    await this.queue?.add(
      this.queueName,
      {
        character,
        callbackId,
        intervalMs,
      },
      {
        delay: intervalMs,
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  @TrackNewRelicTransaction()
  private async execMonitorCallback(character: ICharacter, callbackId: string, intervalMs: number): Promise<void> {
    // execute character callback
    const characterCallbacks = this.characterMonitorCallback.getCallback(character);

    const callback = characterCallbacks?.[callbackId];

    if (callback) {
      const updatedCharacter = (await Character.findOne({ _id: character._id }).lean({
        virtuals: true,
        defaults: true,
      })) as ICharacter;

      if (!updatedCharacter.isOnline) {
        await this.unwatch(callbackId, character);
        return;
      }

      console.log(
        "CharacterMonitorCallback: ",
        character.name,
        `(${character._id.toString()})`,
        callbackId,
        intervalMs
      );

      // execute callback
      callback(updatedCharacter);

      await this.add(character, callbackId, intervalMs);
    }
  }
}
