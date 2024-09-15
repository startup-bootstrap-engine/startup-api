import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { EntityType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

export interface IBattleCycleTarget {
  targetId: string;
  targetType: EntityType;
}

@provide(BattleCycleManager)
export class BattleCycleManager {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  /**
   * Starts a battle cycle for a character targeting another entity.
   */
  public async startBattleCycle(characterId: string, targetId: string, targetType: EntityType): Promise<void> {
    await this.inMemoryHashTable.set("battle-cycles", characterId, { targetId, targetType });
  }

  /**
   * Checks if a character is currently in a battle cycle.
   */
  public async hasBattleCycle(characterId: string): Promise<boolean> {
    return await this.inMemoryHashTable.has("battle-cycles", characterId);
  }

  /**
   * Updates the target of an ongoing battle cycle.
   */
  public async updateBattleCycleTarget(characterId: string, targetId: string, targetType: EntityType): Promise<void> {
    await this.inMemoryHashTable.set("battle-cycles", characterId, { targetId, targetType });
  }

  /**
   * Stops an ongoing battle cycle for a character.
   */
  public async stopBattleCycle(characterId: string): Promise<void> {
    await this.inMemoryHashTable.delete("battle-cycles", characterId);
  }

  /**
   * Retrieves the current target of a battle cycle.
   */
  public async getCurrentTarget(characterId: string): Promise<IBattleCycleTarget> {
    return (await this.inMemoryHashTable.get("battle-cycles", characterId)) as IBattleCycleTarget;
  }

  /**
   * Clears all battle cycles.
   */
  public async clear(): Promise<void> {
    await this.inMemoryHashTable.deleteAll("battle-cycles");
  }
}
