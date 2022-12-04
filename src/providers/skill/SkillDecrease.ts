import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";
import { SkillCalculator } from "./SkillCalculator";
import {
  ISkillDetails,
  SkillSocketEvents,
  BASIC_ATTRIBUTES,
  COMBAT_SKILLS,
  SKILLS_MAP,
  calculateSPToNextLevel,
} from "@rpg-engine/shared";

@provide(SkillDecrease)
export class SkillDecrease {
  constructor(private skillCalculator: SkillCalculator, private socketMessaging: SocketMessaging) {}

  public async deathPenalty(character: ICharacter): Promise<boolean> {
    try {
      const decreaseXp = await this.decreaseCharacterXp(character);
      const decreaseBasicAttributes = await this.decreaseBasicAttributeSP(character);
      const decreaseCombatSkills = await this.decreaseCombatSkillsSP(character);
      // Crafting Skills penalty here ( not implemented yet )

      return decreaseXp && decreaseBasicAttributes && decreaseCombatSkills;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  private async decreaseCharacterXp(character: ICharacter): Promise<boolean> {
    const skills = await Skill.findOne({ _id: character.skills });

    if (skills) {
      const currentXP = Math.round(skills.experience);
      const deathPenaltyXp = Math.round(currentXP * 0.2);
      const newXpReduced = currentXP - deathPenaltyXp;
      const currentXpLvl = this.skillCalculator.getXPForLevel(skills.level);

      if (newXpReduced <= currentXpLvl && skills.level > 1 && newXpReduced > 1) {
        skills.experience = newXpReduced;
        skills.xpToNextLevel = currentXpLvl - newXpReduced;
        skills.level -= 1;

        await this.updateSkills(skills, character);

        return true;
      } else if (skills.level >= 1 && skills.experience > 2) {
        const xpToNextLevel = this.skillCalculator.calculateXPToNextLevel(newXpReduced, skills.level + 1);

        skills.experience = newXpReduced;
        skills.xpToNextLevel = xpToNextLevel;

        await this.updateSkills(skills, character);

        return true;
      } else {
        return false;
      }
    }

    return false;
  }

  private async updateSkills(skills: ISkill, character: ICharacter): Promise<void> {
    await skills.save();

    this.socketMessaging.sendEventToUser(character.channelId!, SkillSocketEvents.ReadInfo, {
      skill: skills,
    });
  }

  private async decreaseBasicAttributeSP(character: ICharacter): Promise<boolean> {
    const skills = (await Skill.findById(character.skills)) as ISkill;

    if (!skills) {
      throw new Error(`skills not found for character ${character.id}`);
    }

    try {
      for (let i = 0; i < BASIC_ATTRIBUTES.length; i++) {
        this.decreaseSP(skills, BASIC_ATTRIBUTES[i]);
        await this.updateSkills(skills, character);
      }

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  private async decreaseCombatSkillsSP(character: ICharacter): Promise<boolean> {
    const skills = (await Skill.findById(character.skills)) as ISkill;
    if (!skills) {
      throw new Error(`skills not found for character ${character.id}`);
    }

    try {
      for (let i = 0; i < COMBAT_SKILLS.length; i++) {
        this.decreaseSP(skills, COMBAT_SKILLS[i]);
        await this.updateSkills(skills, character);
      }

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  private decreaseSP(skills: ISkill, skillKey: string): void {
    const skillToUpdate = SKILLS_MAP.get(skillKey);

    if (!skillToUpdate) {
      throw new Error(`skill not found for item subtype ${skillKey}`);
    }

    const skill = skills[skillToUpdate] as ISkillDetails;

    const skillPoints = Math.round(skill.skillPoints);
    const deathPenaltySP = Math.round(skill.skillPoints * 0.1);
    const newSpReduced = skillPoints - deathPenaltySP;
    const currentSpLvl = this.skillCalculator.getSPForLevel(skill.level);

    skills[skillToUpdate] = skill;

    if (newSpReduced <= currentSpLvl && skill.level > 1 && newSpReduced > 1) {
      skill.skillPoints = newSpReduced;
      skill.skillPointsToNextLevel = currentSpLvl - newSpReduced;
      skill.level = skill.level - 1;
    } else if (skill.level >= 1 && skill.skillPoints > 2) {
      const spToNextLvl = calculateSPToNextLevel(newSpReduced, skill.level + 1);

      skill.skillPoints = newSpReduced;
      skill.skillPointsToNextLevel = spToNextLvl;
    } else {
      // Do nothing!
    }
  }
}