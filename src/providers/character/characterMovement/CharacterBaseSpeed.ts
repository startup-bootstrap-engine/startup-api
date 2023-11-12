import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { provide } from "inversify-binding-decorators";
import { CharacterBuffSkill } from "../characterBuff/CharacterBuffSkill";

const LEVEL_FAST_SPEED = 50;
const LEVEL_EXTRA_FAST_SPEED = 150;
const BASE_SPEED_TRAIT = "baseSpeed";

@provide(CharacterBaseSpeed)
export class CharacterBaseSpeed {
  constructor(private characterBuffSkill: CharacterBuffSkill) {}

  public async getBaseSpeed(character: ICharacter): Promise<number | undefined> {
    try {
      const skills = await Skill.findById(character.skills)
        .lean()
        .cacheQuery({ cacheKey: `${character._id}-skills` });

      if (!skills || typeof skills !== "object" || !("level" in skills)) {
        return undefined;
      }

      const level = skills.level;
      const buffs = await this.characterBuffSkill.calculateAllActiveBuffs(character);
      let baseSpeedBuffValue = 0; // Default value

      if (buffs) {
        const baseSpeedBuff = buffs.find((buff) => buff.trait === BASE_SPEED_TRAIT);
        baseSpeedBuffValue = baseSpeedBuff?.absoluteChange || 0;
      }

      if (level > LEVEL_FAST_SPEED && level <= LEVEL_EXTRA_FAST_SPEED) {
        return MovementSpeed.Fast + baseSpeedBuffValue;
      } else if (level > LEVEL_EXTRA_FAST_SPEED) {
        return MovementSpeed.ExtraFast + baseSpeedBuffValue;
      }

      return undefined;
    } catch (error) {
      console.error("Error calculating base speed", error);
      return undefined;
    }
  }
}
