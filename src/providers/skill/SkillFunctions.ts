import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { CharacterBaseSpeed } from "@providers/character/characterMovement/CharacterBaseSpeed";
import { SP_INCREASE_BASE, SP_MAGIC_INCREASE_TIMES_MANA } from "@providers/constants/SkillConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NumberFormatter } from "@providers/text/NumberFormatter";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import {
  AnimationEffectKeys,
  IIncreaseSPResult,
  ISkillDetails,
  ISkillEventFromServer,
  IUIShowMessage,
  SkillEventType,
  SkillSocketEvents,
  SkillType,
  UISocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { clearCacheForKey } from "speedgoose";
import { SkillCalculator } from "./SkillCalculator";

@provide(SkillFunctions)
export class SkillFunctions {
  constructor(
    private skillCalculator: SkillCalculator,
    private animationEffect: AnimationEffect,
    private socketMessaging: SocketMessaging,
    private numberFormatter: NumberFormatter,
    private inMemoryHashTable: InMemoryHashTable,
    private newRelic: NewRelic,
    private characterBaseSpeed: CharacterBaseSpeed
  ) {}

  @TrackNewRelicTransaction()
  public async updateSkills(skills: ISkill, character: ICharacter): Promise<ISkill | undefined> {
    try {
      //! Warning: Chaching this causes the skill not to update
      const updatedSkills = await Skill.findByIdAndUpdate(skills._id, skills, {
        new: true, // Return the updated document
        lean: true, // Return a plain JavaScript object
        virtuals: true,
        defaults: true,
      });
      await clearCacheForKey(`${skills._id}-skills`);

      if (!updatedSkills) {
        throw new Error(`Failed to update skills for character ${character._id}`);
      }

      // Update baseSpeed according to skill level
      const baseSpeed = await this.characterBaseSpeed.getBaseSpeed(character);
      if (baseSpeed && character.baseSpeed !== baseSpeed) {
        await Character.updateOne({ _id: character._id }, { $set: { baseSpeed } });
      }

      return updatedSkills;
    } catch (error) {
      console.error("Error in updateSkills:", error);
      return undefined;
    }
  }

  public updateSkillByType(skills: ISkill, skillName: string, bonusOrPenalties: number): boolean {
    let skillLevelUp = false;

    const skill = skills[skillName] as ISkillDetails;

    if (bonusOrPenalties > 0 && skill.skillPoints >= 0) skill.skillPoints += bonusOrPenalties;
    if (bonusOrPenalties < 0 && skill.skillPoints > 0) skill.skillPoints -= bonusOrPenalties * -1;

    skill.skillPointsToNextLevel = this.skillCalculator.calculateSPToNextLevel(skill.skillPoints, skill.level + 1);

    if (skill.skillPointsToNextLevel <= 0) {
      skillLevelUp = true;
      skill.level++;
      skill.skillPointsToNextLevel = this.skillCalculator.calculateSPToNextLevel(skill.skillPoints, skill.level + 1);

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Characters,
        `${skillName}-SkillUp`,
        1
      );
    }

    return skillLevelUp;
  }

  public calculateBonusOrPenaltiesSP(bonusOrPenalties: number, skillLevel: number): number {
    return Number((skillLevel * (1 + Number(bonusOrPenalties.toFixed(2))) * SP_INCREASE_BASE).toFixed(2));
  }

  public calculateBonusOrPenaltiesMagicSP(magicBonusOrPenalties: number, skillLevel: number): number {
    return Number(
      (skillLevel * (1 + Number(magicBonusOrPenalties.toFixed(2))) * SP_MAGIC_INCREASE_TIMES_MANA).toFixed(2)
    );
  }

  @TrackNewRelicTransaction()
  public async sendSkillLevelUpEvents(
    skillData: IIncreaseSPResult,
    character: ICharacter,
    target?: INPC | ICharacter
  ): Promise<void> {
    const behavior = skillData.skillLevelBefore > skillData.skillLevelAfter ? "regressed" : "advanced";
    const skillName = skillData.skillName === "magicResistance" ? "Magic Resistance" : skillData.skillName;

    await this.clearCharacterCache(character);
    await this.sendLevelUpMessage(skillData, character, behavior, skillName);
    await this.sendSkillGainEvent(skillData, character, target);
    await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.SkillLevelUp);
  }

  /**
   * calculateBonus based on skill level
   * @param skillLevel
   * @returns
   */

  public calculateBonus(level: number): number {
    return Number(((level - 1) / 50).toFixed(2));
  }

  private async clearCharacterCache(character: ICharacter): Promise<void> {
    await Promise.all([
      clearCacheForKey(`characterBuffs_${character._id}`),
      clearCacheForKey(`${character._id}-skills`),
      this.inMemoryHashTable.delete("skills-with-buff", character._id),
      this.inMemoryHashTable.delete("load-craftable-items", character._id),
    ]);
  }

  private async sendLevelUpMessage(
    skillData: IIncreaseSPResult,
    character: ICharacter,
    behavior: string,
    skillName: string
  ): Promise<void> {
    const skills = (await Skill.findById(character.skills)
      .lean({ virtuals: true, defaults: true })
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      })) as ISkill;

    const isFighting = this.isFightingSkill(skills, skillData.skillName);
    const message = `You ${behavior} from level ${this.numberFormatter.formatNumber(
      skillData.skillLevelBefore
    )} to ${this.numberFormatter.formatNumber(skillData.skillLevelAfter)} in ${_.startCase(_.toLower(skillName))}${
      isFighting ? " fighting" : ""
    }.`;

    this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
      message,
      type: "info",
    });

    await this.inMemoryHashTable.delete(`${character._id}-skill-level-with-buff`, skillData.skillName);

    // Skill level up happened, ensure cache is cleared
    await clearCacheForKey(`${character._id}-skills`);
  }

  private sendSkillGainEvent(skillData: IIncreaseSPResult, character: ICharacter, target?: INPC | ICharacter): void {
    const levelUpEventPayload: ISkillEventFromServer = {
      characterId: character.id,
      targetId: target?.id,
      targetType: target?.type as "Character" | "NPC",
      eventType: SkillEventType.SkillLevelUp,
      level: skillData.skillLevelBefore,
      skill: skillData.skillName,
    };

    this.socketMessaging.sendEventToUser(character.channelId!, SkillSocketEvents.SkillGain, levelUpEventPayload);
  }

  private isFightingSkill(skills: ISkill, skillName: string): boolean {
    try {
      const skill = skills[skillName] as ISkillDetails;

      return skill.type === SkillType.Combat;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
