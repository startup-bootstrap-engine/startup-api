import {
  ANTI_MACRO_SKIP_EVENTS_FROM_SIMILARITY_CHECK,
  CHARACTER_MAX_ACTIONS_STORAGE_THRESHOLD,
} from "@providers/constants/AntiMacroConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";

@provide(CharacterActionsTracker)
export class CharacterActionsTracker {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async setCharacterAction(characterId: string, action: string): Promise<void> {
    if (ANTI_MACRO_SKIP_EVENTS_FROM_SIMILARITY_CHECK.includes(action)) {
      return;
    }

    const actions = await this.getCharacterActions(characterId);
    actions.push(action);

    // Ensure we don't exceed the maximum storage threshold
    while (actions.length > CHARACTER_MAX_ACTIONS_STORAGE_THRESHOLD) {
      actions.shift();
    }

    await this.inMemoryHashTable.set("character-actions", characterId, actions);
  }

  public async getCharacterActions(characterId: string): Promise<string[]> {
    const actions = (await this.inMemoryHashTable.get("character-actions", characterId)) as string[];
    return actions || [];
  }

  public async clearCharacterActions(characterId: string): Promise<void> {
    await this.inMemoryHashTable.delete("character-actions", characterId);
  }

  public async clearAllCharacterActions(): Promise<void> {
    await this.inMemoryHashTable.deleteAll("character-actions");
  }
}
