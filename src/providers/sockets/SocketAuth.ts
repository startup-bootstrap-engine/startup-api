/* eslint-disable mongoose-lean/require-lean */
/* eslint-disable require-await */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { CharacterSocketEvents } from "@rpg-engine/shared";
import { SocketAuthEventsValidator } from "./SocketAuthEventsValidator";
import { SocketAuthLock } from "./SocketAuthLock";
import { SocketMessaging } from "./SocketMessaging";

@provideSingleton(SocketAuth)
export class SocketAuth {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private socketAuthLock: SocketAuthLock,
    private socketAuthEventsValidator: SocketAuthEventsValidator
  ) {}

  @TrackNewRelicTransaction()
  public authCharacterOn(
    channel,
    event: string,
    callback: (data, character: ICharacter, owner: IUser) => Promise<any>,
    runBasicCharacterValidation: boolean = true,
    isLeanQuery = true
  ): void {
    this.removeListenerIfExists(channel, event);

    channel.on(event, async (data: any) => {
      try {
        if (!(await this.socketAuthLock.acquireGlobalLock(`global-lock-event-${event}-${channel.id}`))) return;

        const [owner, character] = await this.getCharacterAndOwner(channel, data, isLeanQuery);
        if (!(await this.validateCharacterAndProceed(character, channel.id, runBasicCharacterValidation))) return;

        await this.socketAuthEventsValidator.handleEventLogic(event, data, callback, character, owner);
      } catch (error) {
        console.error(error);
      } finally {
        await this.socketAuthLock.releaseGlobalLock(`global-lock-event-${event}-${channel.id}`);
      }
    });
  }

  private removeListenerIfExists(channel, event: string): void {
    channel.removeAllListeners(event);
  }

  private async getCharacterAndOwner(channel, data: any, isLeanQuery: boolean): Promise<[IUser, ICharacter]> {
    const owner = channel?.userData || (channel?.handshake?.query?.userData as IUser);
    const query = { _id: data.socketCharId, owner: owner._id };
    const character = isLeanQuery
      ? await Character.findOne(query).lean({ virtuals: true, defaults: true })
      : await Character.findOne(query);
    return [owner, character as ICharacter];
  }

  private async validateCharacterAndProceed(
    character: ICharacter,
    channelId: string,
    runBasicCharacterValidation: boolean
  ): Promise<boolean> {
    if (!character) {
      this.socketMessaging.sendEventToUser(channelId, CharacterSocketEvents.CharacterForceDisconnect, {
        reason: "You don't own this character!",
      });
      return false;
    }

    if (character.isSoftDeleted) {
      this.socketMessaging.sendEventToUser(channelId, CharacterSocketEvents.CharacterForceDisconnect, {
        reason: "Sorry, you cannot play with this character anymore!",
      });
      return false;
    }

    if (runBasicCharacterValidation) {
      const hasBasicValidation = this.characterValidation.hasBasicValidation(character);

      if (!hasBasicValidation) {
        return false;
      }
    }

    return true;
  }
}
