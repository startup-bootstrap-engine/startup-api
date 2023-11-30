import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { provide } from "inversify-binding-decorators";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { ChatSocketEvents } from "@rpg-engine/shared";

export interface IPrivateChatFindCharacterResponse {
  characters: ICharacter[];
}

@provide(ChatNetworkFindCharacter)
export class ChatNetworkFindCharacter {
  constructor(
    private characterValidation: CharacterValidation,
    private socketMessaging: SocketMessaging,
    private socketAuth: SocketAuth
  ) {}

  public onFindCharacter(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      ChatSocketEvents.PrivateChatMessageFindCharacter,
      async (data, character) => {
        await this.findCharacter(data.name, character);
      }
    );
  }

  private async findCharacter(
    name: string,
    character: ICharacter
  ): Promise<IPrivateChatFindCharacterResponse | undefined> {
    const characterValid = this.characterValidation.hasBasicValidation(character);
    if (!characterValid || !name) {
      return;
    }

    const regex = new RegExp(name, "i");
    const charactersFound = (await Character.find({ name: { $regex: regex } }).limit(5)).reverse();
    if (!charactersFound) {
      return;
    }

    this.socketMessaging.sendEventToUser<IPrivateChatFindCharacterResponse>(
      character.channelId!,
      ChatSocketEvents.PrivateChatMessageFindCharacter,
      {
        characters: charactersFound,
      }
    );

    return {
      characters: charactersFound,
    };
  }
}
