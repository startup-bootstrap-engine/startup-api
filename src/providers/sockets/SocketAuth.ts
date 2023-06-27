import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { CharacterLastAction } from "@providers/character/CharacterLastAction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { appEnv } from "@providers/config/env";
import { BYPASS_EVENTS_AS_LAST_ACTION } from "@providers/constants/EventsConstants";
import { EXHAUSTABLE_EVENTS, LOCKABLE_EVENTS } from "@providers/constants/ServerConstants";
import { ExhaustValidation } from "@providers/exhaust/ExhaustValidation";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { NewRelicTransactionCategory } from "@providers/types/NewRelicTypes";
import { CharacterRepository } from "@repositories/ModuleCharacter/CharacterRepository";
import { CharacterSocketEvents, IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { SocketMessaging } from "./SocketMessaging";

@provideSingleton(SocketAuth)
export class SocketAuth {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private exhaustValidation: ExhaustValidation,
    private characterLastAction: CharacterLastAction,
    private newRelic: NewRelic,
    private characterRepository: CharacterRepository,
    private locker: Locker
  ) {}

  // this event makes sure that the user who's triggering the request actually owns the character!
  public authCharacterOn(
    channel,
    event: string,
    callback: (data, character: ICharacter, owner: IUser) => Promise<any>,
    runBasicCharacterValidation: boolean = true,
    isLeanQuery = true
  ): void {
    channel.on(event, async (data: any) => {
      let owner, character;

      try {
        // check if authenticated user actually owns the character (we'll fetch it from the payload id);
        owner = channel?.userData || (channel?.handshake?.query?.userData as IUser);

        if (isLeanQuery) {
          character = await this.characterRepository.findOne({
            _id: data.socketCharId,
            owner: owner.id,
          });
        } else {
          character = await this.characterRepository.findOne(
            {
              _id: data.socketCharId,
              owner: owner.id,
            },
            {
              leanType: "no-lean",
            }
          );
        }

        if (!character) {
          this.socketMessaging.sendEventToUser(channel.id!, CharacterSocketEvents.CharacterForceDisconnect, {
            reason: "You don't own this character!",
          });
          return;
        }

        if (runBasicCharacterValidation) {
          const hasBasicValidation = this.characterValidation.hasBasicValidation(character);

          if (!hasBasicValidation) {
            return;
          }
        }

        if (appEnv.general.DEBUG_MODE && !appEnv.general.IS_UNIT_TEST) {
          console.log("⬇️ (RECEIVED): ", character.name, character.channelId!, event);
        }

        if (EXHAUSTABLE_EVENTS.includes(event)) {
          const isExhausted = await this.exhaustValidation.verifyLastActionExhaustTime(character.channelId!, event);
          if (isExhausted) {
            this.socketMessaging.sendEventToUser<IUIShowMessage>(channel.id!, UISocketEvents.ShowMessage, {
              message: "Sorry, you're exhausted!",
              type: "error",
            });
            return;
          }
        }

        if (!BYPASS_EVENTS_AS_LAST_ACTION.includes(event as any)) {
          await this.characterLastAction.setLastAction(character._id, dayjs().toISOString());
        }

        await this.newRelic.trackTransaction(
          NewRelicTransactionCategory.SocketEvent,
          event,
          async (): Promise<void> => {
            if (LOCKABLE_EVENTS.includes(event)) {
              await this.performLockedEvent(character._id, character.name, event, async (): Promise<void> => {
                await callback(data, character, owner);
              });

              return;
            }

            await callback(data, character, owner);
          }
        );

        // console.log(`📨 Received ${event} from ${character.name}(${character._id}): ${JSON.stringify(data)}`);
      } catch (error) {
        console.error(`${character.name} => ${event}, channel ${channel} failed with error: ${error}`);

        if (LOCKABLE_EVENTS.includes(event)) {
          await this.locker.unlock(`event-${event}-${character._id}`);
        }
      }
    });
  }

  // This prevents the user from spamming the same event over and over again to gain some benefits (like duplicating items)
  private async performLockedEvent(
    characterId: string,
    characterName: string,
    event: string,
    callback: () => Promise<void>
  ): Promise<void> {
    try {
      const hasLocked = await this.locker.lock(`event-${event}-${characterId}`);
      if (!hasLocked) {
        console.log(`⚠️ ${characterId} - (${characterName}) tried to perform '${event}' but it was locked!`);
        return;
      }
      await callback();
    } catch (error) {
      console.error(error);
      await this.locker.unlock(`event-${event}-${characterId}`);
    } finally {
      await this.locker.unlock(`event-${event}-${characterId}`);
    }
  }
}
