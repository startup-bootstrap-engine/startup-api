import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { CharacterActionsTracker } from "@providers/character/CharacterActionsTracker";
import { CharacterLastAction } from "@providers/character/CharacterLastAction";
import { appEnv } from "@providers/config/env";
import { BYPASS_EVENTS_AS_LAST_ACTION } from "@providers/constants/EventsConstants";
import {
  CUSTOM_EXHAUSTABLE_EVENTS,
  EXHAUSTABLE_EVENTS,
  LOCKABLE_EVENTS,
  LOGGABLE_EVENTS,
  THROTTABLE_EVENTS,
} from "@providers/constants/ServerConstants";
import { ExhaustValidation } from "@providers/exhaust/ExhaustValidation";
import { NewRelicTransactionCategory } from "@providers/types/NewRelicTypes";
import { IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { SocketAuthLock } from "./SocketAuthLock";
import { SocketMessaging } from "./SocketMessaging";

@provide(SocketAuthEventsValidator)
export class SocketAuthEventsValidator {
  constructor(
    private characterLastAction: CharacterLastAction,
    private exhaustValidation: ExhaustValidation,
    private socketMessaging: SocketMessaging,
    private newRelic: NewRelic,
    private socketAuthLock: SocketAuthLock,
    private characterActionsTracker: CharacterActionsTracker
  ) {}

  public async handleEventLogic<T>(
    event: string,
    data: T,
    callback: (data: T, character: ICharacter, owner: IUser) => Promise<any>,
    character: ICharacter,
    owner: IUser
  ): Promise<void> {
    try {
      await this.newRelic.trackTransaction(NewRelicTransactionCategory.SocketEvent, event, async () => {
        if (await this.preProcessEventChecks(event, character)) {
          await this.processEvent(event, data, callback, character, owner);
        }
      });
    } catch (error) {
      console.error(`Error processing event ${event} for character ${character._id} - ${character.name}: ${error}`);
    }
  }

  public shouldLogEvent(event: string): boolean {
    return appEnv.general.DEBUG_MODE && !appEnv.general.IS_UNIT_TEST && LOGGABLE_EVENTS.includes(event);
  }

  public shouldSetLastAction(event: string): boolean {
    return !BYPASS_EVENTS_AS_LAST_ACTION.includes(event as any);
  }

  public async isExhausted(character: ICharacter, event: string): Promise<boolean> {
    const result =
      (EXHAUSTABLE_EVENTS.includes(event) || CUSTOM_EXHAUSTABLE_EVENTS[event]) &&
      (await this.exhaustValidation.verifyLastActionExhaustTime(character.channelId!, event));

    return result;
  }

  public notifyExhaustion(channelId: string): void {
    this.socketMessaging.sendEventToUser<IUIShowMessage>(channelId, UISocketEvents.ShowMessage, {
      message: "Sorry, you're exhausted!",
      type: "error",
    });
  }

  public logEvent(character: ICharacter, event: string): void {
    console.log(
      `📝 ${character.name} (Id: ${character._id}) - (Channel: ${
        character.channelId
      }) => Event: ${event} at ${dayjs().toISOString()}`
    );
  }

  public async isThrottleViolated(character: ICharacter, event: string): Promise<boolean> {
    if (Object.keys(THROTTABLE_EVENTS).includes(event)) {
      const lastActionExecution = await this.characterLastAction.getActionLastExecution(character._id, event);

      if (lastActionExecution) {
        const diff = dayjs().diff(dayjs(lastActionExecution), "millisecond");

        const isDiffLowerThanThreshold = diff < THROTTABLE_EVENTS[event];

        if (isDiffLowerThanThreshold) {
          this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
            message: "Sorry, you're doing it too fast! Please slow down!",
            type: "error",
          });
          console.log(`⚠️ Throttle violation for ${event} on character ${character._id} (${character.name})`);

          return true;
        }
      }

      await this.characterLastAction.setActionLastExecution(character._id, event);
    }

    return false;
  }

  private async preProcessEventChecks(event: string, character: ICharacter): Promise<boolean> {
    const shouldLog = this.shouldLogEvent(event);
    if (shouldLog) {
      this.logEvent(character, event);
    }

    const isExhausted = await this.isExhausted(character, event);
    if (isExhausted) {
      this.notifyExhaustion(character.channelId!);
      return false;
    }

    const isThrottleViolated = await this.isThrottleViolated(character, event);
    if (isThrottleViolated) {
      return false;
    }

    return true;
  }

  private async processEvent<T>(
    event: string,
    data: T,
    callback: (data: T, character: ICharacter, owner: IUser) => Promise<any>,
    character: ICharacter,
    owner: IUser
  ): Promise<void> {
    const shouldSetLastAction = this.shouldSetLastAction(event);
    if (shouldSetLastAction) {
      await this.characterLastAction.setLastAction(character._id, dayjs().toISOString());
    }

    await this.characterActionsTracker.setCharacterAction(character._id, event);

    const isLockableEvent = LOCKABLE_EVENTS.includes(event);
    if (isLockableEvent) {
      await this.socketAuthLock.performLockedEvent(character._id, character.name, event, () =>
        callback(data, character, owner)
      );
    } else {
      await callback(data, character, owner);
    }
  }
}
