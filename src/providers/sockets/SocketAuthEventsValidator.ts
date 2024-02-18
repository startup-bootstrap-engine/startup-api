import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { CharacterLastAction } from "@providers/character/CharacterLastAction";
import { appEnv } from "@providers/config/env";
import { BYPASS_EVENTS_AS_LAST_ACTION } from "@providers/constants/EventsConstants";
import {
  EXHAUSTABLE_EVENTS,
  LOCKABLE_EVENTS,
  LOGGABLE_EVENTS,
  THROTTABLE_DEFAULT_MS_THRESHOLD,
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
    private socketAuthLock: SocketAuthLock
  ) {}

  public async handleEventLogic(
    channel,
    event: string,
    data: any,
    callback: (data, character: ICharacter, owner: IUser) => Promise<any>,
    character: ICharacter,
    owner: IUser
  ): Promise<void> {
    await this.newRelic.trackTransaction(NewRelicTransactionCategory.SocketEvent, event, async (): Promise<void> => {
      const shouldLog = this.shouldLogEvent(event);
      const shouldSetLastAction = this.shouldSetLastAction(event);
      const isLockableEvent = LOCKABLE_EVENTS.includes(event);

      const [isExhausted, isThrottleViolated] = await Promise.all([
        this.isExhausted(character, event),
        this.isThrottleViolated(character, event),
      ]);

      if (shouldLog) {
        this.logEvent(character, event);
      }

      if (isExhausted) {
        this.notifyExhaustion(channel);
        return;
      }

      if (isThrottleViolated) {
        return;
      }

      if (shouldSetLastAction) {
        await this.characterLastAction.setLastAction(character._id, dayjs().toISOString());
      }

      if (isLockableEvent) {
        await this.socketAuthLock.performLockedEvent(character._id, character.name, event, async () => {
          await callback(data, character, owner);
        });
        return;
      }

      await callback(data, character, owner);
    });
  }

  public shouldLogEvent(event: string): boolean {
    return appEnv.general.DEBUG_MODE && !appEnv.general.IS_UNIT_TEST && LOGGABLE_EVENTS.includes(event);
  }

  public shouldSetLastAction(event: string): boolean {
    return !BYPASS_EVENTS_AS_LAST_ACTION.includes(event as any);
  }

  public async isExhausted(character: ICharacter, event: string): Promise<boolean> {
    return (
      EXHAUSTABLE_EVENTS.includes(event) &&
      (await this.exhaustValidation.verifyLastActionExhaustTime(character.channelId!, event))
    );
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

        if (diff < THROTTABLE_DEFAULT_MS_THRESHOLD) {
          this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
            message: "Sorry, you're doing it too fast!",
            type: "error",
          });

          return true;
        }
      }

      await this.characterLastAction.setActionLastExecution(character._id, event);
    }

    return false;
  }
}
