import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(CharacterValidation)
export class CharacterValidation {
  constructor(private socketMessaging: SocketMessaging) {}

  public hasBasicValidation(character: ICharacter): boolean {
    if (!character.isOnline) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you are not online.");
      return false;
    }

    if (!character.isAlive) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you are dead.");
      return false;
    }

    if (character.isBanned) {
      this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.CharacterForceDisconnect, {
        reason: "You cannot use this character while banned.",
      });

      return false;
    }

    return true;
  }
}