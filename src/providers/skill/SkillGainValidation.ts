import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CUSTOM_SKILL_INCREASE_TIMEOUT, SP_INCREASE_SECONDS_TIMEOUT } from "@providers/constants/SkillConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";

@provide(SkillGainValidation)
export class SkillGainValidation {
  constructor(private characterValidation: CharacterValidation, private inMemoryHashTable: InMemoryHashTable) {}

  public async canUpdateSkills(character: ICharacter, attackerSkills: ISkill, skillName: string): Promise<boolean> {
    try {
      const hasBasicValidation = this.characterValidation.hasBasicValidation(character);

      if (!hasBasicValidation) {
        return false;
      }

      let skill = attackerSkills[skillName];

      if (!skill) {
        const skills = await this.fetchSkills(character._id);

        skill = skills[skillName];
      }

      const lastSkillGain = skill.lastSkillGain || new Date();

      // check if 1 min has passed since last skill gain (use dayjs)

      const now = dayjs();
      const lastSkillGainDate = dayjs(lastSkillGain);

      const diff = now.diff(lastSkillGainDate, "seconds");

      if (diff <= (CUSTOM_SKILL_INCREASE_TIMEOUT?.[skillName] || SP_INCREASE_SECONDS_TIMEOUT)) {
        return false;
      }

      //! removing this line will cause basic attributes to not update lastSkillGain! I know its not ideal, but it works. I guess its getting overwritten by the updateSkills method on SkillIncrease, but I couldn't manage to fix the bug.
      skill.lastSkillGain = new Date();
      await this.clearSkillCache(character, skillName);

      return true;
    } catch (error) {
      console.error(
        `Error while running canUpdateSkills method for character ${character._id.toString()}, skillName: ${skillName} - ${error}`
      );

      return false;
    }
  }

  private async fetchSkills(ownerId: string): Promise<ISkill> {
    return (await Skill.findOne({
      owner: ownerId,
    }).lean({
      virtuals: true,
      defaults: true,
    })) as ISkill;
  }

  private async clearSkillCache(character: ICharacter, skillName: string): Promise<void> {
    await clearCacheForKey(`${character._id}-skills`);
    await this.inMemoryHashTable.delete("skills-with-buff", character._id);
    await this.inMemoryHashTable.delete(`${character._id}-skill-level-with-buff`, skillName);
    await clearCacheForKey(`characterBuffs_${character._id}`);
  }
}
