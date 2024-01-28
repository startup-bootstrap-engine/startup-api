import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterSocketEvents } from "@rpg-engine/shared";
import { CharacterValidation } from "../CharacterValidation";
import { provide } from "inversify-binding-decorators";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";

interface ICharacterSearchByNameResponse {
  characters: ICharacter[];
}

@provide(CharacterNetworkSearch)
export class CharacterNetworkSearch {
  constructor(
    private characterValidation: CharacterValidation,
    private socketMessaging: SocketMessaging,
    private socketAuth: SocketAuth
  ) {}

  @TrackNewRelicTransaction()
  public onFindCharacter(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, CharacterSocketEvents.CharacterSearchByName, async (data, character) => {
      await this.findCharacter(data.name, character);
    });
  }

  private async findCharacter(
    name: string,
    character: ICharacter
  ): Promise<ICharacterSearchByNameResponse | undefined> {
    const characterValid = this.characterValidation.hasBasicValidation(character);
    if (!characterValid || !name) {
      return;
    }

    const regex = new RegExp(name, "i");
    const charactersFound = (await Character.find({ name: { $regex: regex } }).limit(5)).reverse();
    if (!charactersFound) {
      return;
    }

    this.socketMessaging.sendEventToUser<ICharacterSearchByNameResponse>(
      character.channelId!,
      CharacterSocketEvents.CharacterSearchByName,
      {
        characters: charactersFound,
      }
    );

    return {
      characters: charactersFound,
    };
  }
}
