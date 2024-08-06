import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Time } from "@providers/time/Time";
import { provide } from "inversify-binding-decorators";
import { AdvancedTutorialKeys, AdvancedTutorialSocketEvents, IAdvancedTutorialPayload } from "../tutorial.types";

@provide(AdvancedTutorial)
export class AdvancedTutorial {
  private readonly prefix = "advanced-tutorial";

  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private socketMessaging: SocketMessaging,
    private time: Time
  ) {}

  public async triggerTutorialOnce(
    character: ICharacter,
    tutorialKey: AdvancedTutorialKeys,
    delayMs?: number
  ): Promise<void> {
    const hasFinishedTutorial = await this.hasFinishedTutorialByKey(character, tutorialKey);

    if (hasFinishedTutorial) {
      return;
    }

    if (delayMs) {
      await this.time.waitForMilliseconds(delayMs);
    }

    this.socketMessaging.sendEventToUser<IAdvancedTutorialPayload>(
      character.channelId!,
      AdvancedTutorialSocketEvents.TriggerTutorial,
      {
        tutorialKey,
      }
    );

    await this.setFinishedTutorialByKey(character, tutorialKey);
  }

  private async hasFinishedTutorialByKey(character: ICharacter, tutorialKey: AdvancedTutorialKeys): Promise<boolean> {
    const result = (await this.inMemoryHashTable.get(this.prefix, character._id)) as unknown as Record<string, boolean>;

    const hasFinishedTutorial = result ? result[tutorialKey] : false;

    return hasFinishedTutorial;
  }

  private async setFinishedTutorialByKey(character: ICharacter, tutorialKey: AdvancedTutorialKeys): Promise<void> {
    const result = (await this.inMemoryHashTable.get(this.prefix, character._id)) as unknown as Record<string, boolean>;

    const updatedResult = {
      ...result,
      [tutorialKey]: true,
    };

    await this.inMemoryHashTable.set(this.prefix, character._id, updatedResult);
  }
}
