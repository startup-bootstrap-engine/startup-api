import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { EXP_CALCULATION_RATIO } from "@providers/constants/SkillConstants";
import { provide } from "inversify-binding-decorators";

@provide(NPCExperienceCalculator)
export class NPCExperienceCalculator {
  public calculateExperience(baseHealth: number, skills: Partial<ISkill>): number {
    return calculateExperience(baseHealth, skills);
  }
}

export const calculateExperience = (baseHealth: number, skills: Partial<ISkill>): number => {
  const total = baseHealth + skills.level! + skills.strength.level + skills.dexterity.level + skills.resistance.level;

  return Math.floor((total * EXP_CALCULATION_RATIO) / 5);
};
