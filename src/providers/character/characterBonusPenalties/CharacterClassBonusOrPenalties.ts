import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CLASS_BONUS_OR_PENALTIES } from "@providers/constants/SkillConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { CharacterClass } from "@rpg-engine/shared";
import {
  IBasicAttributesBonusAndPenalties,
  ICombatSkillsBonusAndPenalties,
  ICraftingSkillsBonusAndPenalties,
} from "@rpg-engine/shared/dist/types/skills.types";
import { provide } from "inversify-binding-decorators";

@provide(CharacterClassBonusOrPenalties)
export class CharacterClassBonusOrPenalties {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public getClassBonusOrPenalties(characterClass: CharacterClass): {
    basicAttributes: IBasicAttributesBonusAndPenalties;
    combatSkills: ICombatSkillsBonusAndPenalties;
    craftingSkills: ICraftingSkillsBonusAndPenalties;
  } {
    // eslint-disable-next-line mongoose-lean/require-lean
    const foundClass = CLASS_BONUS_OR_PENALTIES.find((data) => data.class === characterClass);

    if (!foundClass) {
      throw new Error(`Invalid Class: ${characterClass}`);
    }
    return {
      basicAttributes: foundClass.basicAttributes,
      combatSkills: foundClass.combatSkills,
      craftingSkills: foundClass.craftingSkills,
    };
  }

  @TrackNewRelicTransaction()
  public async getClassBonusOrPenaltiesBuffs(characterId: string): Promise<Record<string, number>> {
    const characterBonusPenalties = await this.inMemoryHashTable.get("character-bonus-penalties", characterId);

    if (characterBonusPenalties) {
      return characterBonusPenalties;
    }

    const character = await Character.findById(characterId).lean({ virtuals: true, defaults: true }).select("class");

    if (!character) {
      throw new Error(`Character not found: ${characterId}`);
    }

    const classBonusPenalties = this.getClassBonusOrPenalties(character.class as CharacterClass);

    const parsedBonusAndPenalties = this.parseBonusAndPenalties(classBonusPenalties);

    await this.inMemoryHashTable.set("character-bonus-penalties", characterId, parsedBonusAndPenalties);
    return parsedBonusAndPenalties;
  }

  private parseBonusAndPenalties(bonusAndPenalties: Record<string, any>): Record<string, number> {
    let result = {};

    for (const [, value] of Object.entries(bonusAndPenalties)) {
      result = {
        ...result,
        ...value,
      };
    }

    for (const [key, value] of Object.entries(result) as any) {
      result[key] = value * 100;
    }

    return result;
  }
}
