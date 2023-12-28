import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CUSTOM_SKILL_INCREASE_TIMEOUT, SP_INCREASE_SECONDS_TIMEOUT } from "@providers/constants/SkillConstants";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";

@provide(SkillGainValidation)
export class SkillGainValidation {
  constructor(private characterValidation: CharacterValidation) {}

  public async canUpdateSkills(character: ICharacter, attackerSkills: ISkill, skillName: string): Promise<boolean> {
    try {
      if (!character || !attackerSkills || typeof skillName !== "string" || skillName.length <= 0) {
        console.error("Invalid inputs to canUpdateSkills");
        return false;
      }

      const hasBasicValidation = this.characterValidation.hasBasicValidation(character);

      if (!hasBasicValidation) {
        return false;
      }

      const skill = attackerSkills[skillName];

      if (!skill) {
        console.error(`Skill ${skillName} not found in attackerSkills`);
        return false;
      }

      let lastSkillGain = dayjs(skill.lastSkillGain) || dayjs();

      const now = dayjs();
      if (lastSkillGain.isAfter(now)) {
        console.warn(`lastSkillGain for skill ${skillName} is in the future, resetting to current date`);
        lastSkillGain = now;
      }

      const lastSkillGainDate = dayjs(lastSkillGain);

      const diff = now.diff(lastSkillGainDate, "seconds");

      if (diff <= (CUSTOM_SKILL_INCREASE_TIMEOUT?.[skillName] || SP_INCREASE_SECONDS_TIMEOUT)) {
        return false;
      }

      //! removing this line will cause basic attributes to not update lastSkillGain! I know its not ideal, but it works. I guess its getting overwritten by the updateSkills method on SkillIncrease, but I couldn't manage to fix the bug.
      skill.lastSkillGain = dayjs();

      await this.clearSkillCache(character);

      return true;
    } catch (error) {
      console.error("Error in canUpdateSkills:", error);
      return false;
    }
  }

  private async clearSkillCache(character: ICharacter): Promise<void> {
    await clearCacheForKey(`${character._id}-skills`);
  }
}
