import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ISimpleTutorialWithKey, SimpleTutorialSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(SimpleTutorial)
export class SimpleTutorial {
  constructor(private socketMessaging: SocketMessaging, private inMemoryHashTable: InMemoryHashTable) {}

  public async sendSimpleTutorialActionToCharacter(character: ICharacter, actionKey: string): Promise<void> {
    try {
      const previousActions =
        ((await this.inMemoryHashTable.get("simple-tutorial-actions", character._id)) as unknown as string[]) ?? [];

      if (previousActions?.includes(actionKey)) {
        return;
      }

      this.socketMessaging.sendEventToUser<ISimpleTutorialWithKey>(
        character.channelId!,
        SimpleTutorialSocketEvents.SimpleTutorialWithKey,
        {
          key: actionKey,
        }
      );

      await this.inMemoryHashTable.set("simple-tutorial-actions", character._id, [
        ...(previousActions || []),
        actionKey,
      ]);
    } catch (error) {
      console.error(error);
    }
  }
}
