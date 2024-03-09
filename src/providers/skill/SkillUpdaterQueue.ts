import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { CharacterBuffSkill } from "@providers/character/characterBuff/CharacterBuffSkill";
import { CharacterBaseSpeed } from "@providers/character/characterMovement/CharacterBaseSpeed";
import { appEnv } from "@providers/config/env";
import { SP_INCREASE_BASE, SP_MAGIC_INCREASE_TIMES_MANA } from "@providers/constants/SkillConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NumberFormatter } from "@providers/text/NumberFormatter";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import {
  AnimationEffectKeys,
  EnvType,
  IIncreaseSPResult,
  ISkillDetails,
  ISkillEventFromServer,
  IUIShowMessage,
  SkillEventType,
  SkillSocketEvents,
  SkillType,
  UISocketEvents,
} from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import _ from "lodash";
import { clearCacheForKey } from "speedgoose";
import { SkillBuff } from "./SkillBuff";
import { SkillCalculator } from "./SkillCalculator";

@provideSingleton(SkillUpdaterQueue)
export class SkillUpdaterQueue {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;

  private queueName = (scene: string): string =>
    `skill-updater-${appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id}-${scene}`;

  constructor(
    private skillCalculator: SkillCalculator,
    private animationEffect: AnimationEffect,
    private socketMessaging: SocketMessaging,
    private characterBuffSkill: CharacterBuffSkill,
    private numberFormatter: NumberFormatter,
    private skillBuff: SkillBuff,
    private inMemoryHashTable: InMemoryHashTable,
    private newRelic: NewRelic,
    private characterBaseSpeed: CharacterBaseSpeed,
    private redisManager: RedisManager
  ) {}

  public initQueue(scene: string): void {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue(this.queueName(scene), {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.queue.on("error", async (error) => {
          console.error(`Error in the ${this.queueName(scene)}:`, error);

          await this.queue?.close();
          this.queue = null;
        });
      }
    }

    if (!this.worker) {
      this.worker = new Worker(
        this.queueName(scene),
        async (job) => {
          const { skills, character } = job.data;

          console.log("processing job", skills._id, character._id);

          try {
            await this.execUpdateSkills(skills, character);
          } catch (err) {
            console.error(`Error processing ${this.queueName(scene)} for Character ${character.name}:`, err);
            throw err;
          }
        },
        {
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.log(`${this.queueName(scene)} job ${job?.id} failed with error ${err.message}`);

          await this.worker?.close();
          this.worker = null;
        });
      }
    }
  }

  public async clearAllJobs(): Promise<void> {
    const jobs = (await this.queue?.getJobs(["waiting", "active", "delayed", "paused"])) ?? [];
    for (const job of jobs) {
      try {
        await job?.remove();
      } catch (err) {
        console.error(`Error removing job ${job?.id}:`, err.message);
      }
    }
  }

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();

    this.queue = null;
    this.worker = null;
  }

  public async updateSkills(skills: ISkill, character: ICharacter): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execUpdateSkills(skills, character);
      return;
    }

    if (!this.connection || !this.queue || !this.worker) {
      this.initQueue(character.scene);
    }

    console.log("sending to queue, ids", skills._id, character._id);

    await this.queue?.add(
      this.queueName(character.scene),
      {
        skills,
        character,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  @TrackNewRelicTransaction()
  private async execUpdateSkills(skills: ISkill, character: ICharacter): Promise<void> {
    try {
      await clearCacheForKey(`${character._id}-skills`);
      //! Warning: Chaching this causes the skill not to update
      await Skill.findByIdAndUpdate(skills._id, skills).lean({ virtuals: true, defaults: true });

      const [buffedSkills, buffs] = await Promise.all([
        this.skillBuff.getSkillsWithBuff(character),
        this.characterBuffSkill.calculateAllActiveBuffs(character),
      ]);

      // update baseSpeed according to skill level
      const baseSpeed = await this.characterBaseSpeed.getBaseSpeed(character);
      if (baseSpeed && character.baseSpeed !== baseSpeed) {
        await Character.updateOne({ _id: character._id }, { $set: { baseSpeed } });
      }

      this.socketMessaging.sendEventToUser(character.channelId!, SkillSocketEvents.ReadInfo, {
        skill: buffedSkills,
        buffs,
      });
    } catch (error) {
      console.log(error);
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
