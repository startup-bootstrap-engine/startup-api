import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { CharacterSocketEvents, ICharacterPing } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(CharacterNetworkPing)
export class CharacterNetworkPing {
  constructor(private socketAuth: SocketAuth, private socketMessaging: SocketMessaging) {}

  public onCharacterPing(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      CharacterSocketEvents.CharacterPing,
      async (data: ICharacterPing, character) => {
        this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.CharacterPing, data);

        await Character.updateOne(
          {
            _id: data.id,
          },
          {
            $set: {
              updatedAt: new Date(),
            },
          }
        );
      }
    );
  }
}
