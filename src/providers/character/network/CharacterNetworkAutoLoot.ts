import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { CharacterSocketEvents, ICharacterAutoLootFromClient } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterAutoLoot } from "../CharacterAutoLoot";

@provide(CharacterNetworkAutoLoot)
export class CharacterNetworkAutoLoot {
  constructor(private socketAuth: SocketAuth, private characterAutoLoot: CharacterAutoLoot) {}

  public onCharacterAutoLoot(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      CharacterSocketEvents.CharacterAutoLoot,
      async ({ itemIdsToLoot }: ICharacterAutoLootFromClient, character: ICharacter) => {
        await this.characterAutoLoot.autoLoot(character, itemIdsToLoot);
      }
    );
  }
}
