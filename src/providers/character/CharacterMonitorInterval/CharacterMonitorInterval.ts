import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { Locker } from "@providers/locks/Locker";

// uniqueId
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { CharacterMonitorCallbackTracker } from "./CharacterMonitorCallbackTracker";

import { provideSingleton } from "@providers/inversify/provideSingleton";

type CharacterMonitorCallback = (character: ICharacter) => Promise<void>;

@provideSingleton(CharacterMonitorInterval)
export class CharacterMonitorInterval {
  constructor(
    private newRelic: NewRelic,
    private locker: Locker,
    private characterMonitorCallbackTracker: CharacterMonitorCallbackTracker
  ) {}

  @TrackNewRelicTransaction()
  public async watch(
    callbackId: string,
    character: ICharacter,
    callback: CharacterMonitorCallback,
    intervalMs: number = 7000
  ): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`character-monitor-interval-${character._id}-callback-${callbackId}`);

      if (!canProceed) {
        console.log("CharacterMonitorInterval - Lock not acquired");
        // concurrency control
        return;
      }

      const hasCallback = await this.characterMonitorCallbackTracker.getCallback(character, callbackId);

      if (hasCallback) {
        // already watching
        return;
      }

      await this.characterMonitorCallbackTracker.setCallback(character, callbackId);

      if (intervalMs < 3000) {
        intervalMs = 3000;
      }

      const interval = setInterval(async () => {
        try {
          const hasCallback = await this.characterMonitorCallbackTracker.getCallback(character, callbackId);

          // if it does not have a tracked callback,it means we should kill this interval
          if (!hasCallback) {
            clearInterval(interval);
            return;
          }

          const updatedCharacter = (await Character.findOne({ _id: character._id }).lean({
            virtuals: true,
            defaults: true,
          })) as ICharacter;

          if (!updatedCharacter || !updatedCharacter?.isOnline) {
            await this.unwatch(callbackId, character, "Character is not online or not found");
            return;
          }

          console.log(
            "CharacterMonitorCallback: ",
            character.name,
            `(${character._id.toString()})`,
            callbackId,
            "Timeout: ",
            intervalMs
          );

          await this.newRelic.trackMetric(
            NewRelicMetricCategory.Count,
            NewRelicSubCategory.Characters,
            "CharacterMonitor",
            1
          );

          await callback(updatedCharacter);
        } catch (error) {
          console.error(error);
        }
      }, intervalMs);
    } catch (error) {
      console.error(error);
      await this.unwatch(callbackId, character, "Error on characterMonitorInterval.watch");
    } finally {
      await this.locker.unlock(`character-monitor-interval-${character._id}-callback-${callbackId}`);
    }
  }

  public async hasWatch(callbackId: string, character: ICharacter): Promise<boolean> {
    return await this.characterMonitorCallbackTracker.hasCallback(character, callbackId);
  }

  @TrackNewRelicTransaction()
  public async unwatch(callbackId: string, character: ICharacter, reason: string): Promise<void> {
    console.log(
      "CharacterMonitorInterval - Unwatching",
      character.name,
      `(${character._id.toString()})`,
      callbackId,
      "Reason: ",
      reason
    );
    await this.characterMonitorCallbackTracker.removeCallback(character, callbackId);
  }

  public async unwatchAll(character: ICharacter): Promise<void> {
    await this.characterMonitorCallbackTracker.removeAllCallbacks(character);
  }
}
