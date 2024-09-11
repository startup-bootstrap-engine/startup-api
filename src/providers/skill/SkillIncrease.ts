import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterWeapon } from "@providers/character/CharacterWeapon";
import { CharacterBonusPenalties } from "@providers/character/characterBonusPenalties/CharacterBonusPenalties";
import { CharacterBuffSkill } from "@providers/character/characterBuff/CharacterBuffSkill";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import {
  LOW_SKILL_LEVEL_SP_INCREASE_BONUS,
  ML_INCREASE_RATIO_MAGE,
  ML_INCREASE_RATIO_OTHERS,
  SP_CRAFTING_INCREASE_RATIO,
  SP_INCREASE_BASE,
  SP_MAGIC_INCREASE_TIMES_MANA,
} from "@providers/constants/SkillConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { GuildSkillsIncrease } from "@providers/guild/GuildSkillsIncrease";
import { NPCExperience } from "@providers/npc/NPCExperience/NPCExperience";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NumberFormatter } from "@providers/text/NumberFormatter";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { CharacterClass } from "@rpg-engine/shared";
import { ItemSubType } from "@rpg-engine/shared/dist/types/item.types";
import {
  BasicAttribute,
  IIncreaseSPResult,
  ISkillDetails,
  SKILLS_MAP,
  SkillSocketEvents,
  SkillType,
} from "@rpg-engine/shared/dist/types/skills.types";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { clearCacheForKey } from "speedgoose";
import { SkillBuff } from "./SkillBuff";
import { SkillCalculator } from "./SkillCalculator";
import { SkillCraftingMapper } from "./SkillCraftingMapper";
import { SkillFunctions } from "./SkillFunctions";
import { SkillGainValidation } from "./SkillGainValidation";
import { CraftingSkillsMap } from "./constants";

@provide(SkillIncrease)
export class SkillIncrease {
  constructor(
    private skillCalculator: SkillCalculator,
    private characterBonusPenalties: CharacterBonusPenalties,
    private skillFunctions: SkillFunctions,
    private skillGainValidation: SkillGainValidation,
    private characterWeapon: CharacterWeapon,
    private inMemoryHashTable: InMemoryHashTable,
    private characterWeight: CharacterWeightQueue,
    private skillMapper: SkillCraftingMapper,
    private numberFormatter: NumberFormatter,
    private npcExperience: NPCExperience,
    private newRelic: NewRelic,
    private discordBot: DiscordBot,
    private guildSkillsIncrease: GuildSkillsIncrease,
    private skillBuff: SkillBuff,
    private characterBuffSkill: CharacterBuffSkill,
    private socketMessaging: SocketMessaging
  ) {}

  /**
   * Calculates the sp gained according to weapons used and the xp gained by a character every time it causes damage in battle.
   * If new skill level is reached, sends the corresponding event to the character
   *
   */
  @TrackNewRelicTransaction()
  public async increaseSkillsOnBattle(
    attacker: ICharacter,
    target: ICharacter | INPC,
    damage: number,
    spellHit?: boolean
  ): Promise<void> {
    try {
      const skills = await this.fetchCharacterSkills(attacker);

      if (!skills) {
        throw new Error(`skills not found for character ${attacker.id}`);
      }

      // Ensure SP is not below minimum for any skill
      this.ensureMinimumSP(skills);

      const weapon = await this.characterWeapon.getWeapon(attacker);
      const weaponSubType = weapon?.item ? weapon?.item.subType || "None" : "None";
      const skillName = SKILLS_MAP.get(weaponSubType);

      if (!skillName) {
        throw new Error(`Skill not found for weapon ${weaponSubType}`);
      }

      await this.npcExperience.recordXPinBattle(attacker, target, damage);

      if (spellHit) {
        return;
      }

      const canIncreaseSP = await this.skillGainValidation.canUpdateSkills(attacker, skills, skillName);
      if (!canIncreaseSP) return;

      const targetSkills = target.skills as ISkill;

      const increasedWeaponSP = this.increaseSP(
        skills,
        weaponSubType,
        undefined,
        SKILLS_MAP,
        this.skillFunctions.calculateBonus(targetSkills?.level)
      );

      let increasedStrengthSP;
      if (weaponSubType !== ItemSubType.Magic && weaponSubType !== ItemSubType.Staff) {
        increasedStrengthSP = this.increaseSP(skills, BasicAttribute.Strength);
      }

      const guildSkills = await this.guildSkillsIncrease.getGuildSkills(attacker);
      if (guildSkills) {
        const guildSkillsDetails: ISkillDetails = {
          type: SkillType.Guild,
          level: guildSkills.level,
          skillPoints: guildSkills.guildPoints,
          skillPointsToNextLevel: guildSkills.guildPointsToNextLevel,
        };

        const newSP = this.calculateNewSP(guildSkillsDetails);
        if (newSP) {
          await this.guildSkillsIncrease.increaseGuildSkills(guildSkills, newSP);
        }
      }

      await clearCacheForKey(`${attacker._id}-skills`);

      const updatedSkills = await this.skillFunctions.updateSkills(skills, attacker);

      attacker.skills = updatedSkills;

      await this.characterBonusPenalties.applyRaceBonusPenalties(attacker, weaponSubType);

      if (weaponSubType !== ItemSubType.Magic && weaponSubType !== ItemSubType.Staff) {
        await this.characterBonusPenalties.applyRaceBonusPenalties(attacker, BasicAttribute.Strength);
      }

      if (increasedStrengthSP?.skillLevelUp && attacker.channelId) {
        await this.skillFunctions.sendSkillLevelUpEvents(increasedStrengthSP, attacker, target);
        await this.characterWeight.updateCharacterWeight(attacker);
      }

      if (increasedWeaponSP?.skillLevelUp && attacker.channelId) {
        await this.skillFunctions.sendSkillLevelUpEvents(increasedWeaponSP, attacker, target);
      }

      if (increasedStrengthSP?.skillLevelUp || increasedWeaponSP?.skillLevelUp) {
        const skillData = increasedStrengthSP?.skillLevelUp ? increasedStrengthSP : increasedWeaponSP;
        const isMultipleOfTen = skillData.skillLevelAfter % 10 === 0;

        if (skillData && isMultipleOfTen) {
          const message = this.discordBot.getRandomLevelUpMessage(
            attacker.name,
            skillData.skillLevelAfter,
            skillData.skillName
          );
          const channel = "achievements";
          const title = "Skill Level Up!";

          await this.discordBot.sendMessageWithColor(message, channel, title);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      await this.sendSkillLevelUpEvents(attacker);
    }
  }

  @TrackNewRelicTransaction()
  public async increaseShieldingSP(character: ICharacter): Promise<void> {
    try {
      const hasShield = await this.characterWeapon.hasShield(character);

      if (!hasShield) {
        return;
      }

      let skills = character.skills as ISkill;

      if (!skills.level) {
        skills = (await this.fetchCharacterSkills(character)) as ISkill;
      }

      if (!skills) {
        throw new Error(`skills not found for character ${character.id}`);
      }

      if (!character) {
        throw new Error("character not found");
      }
      const canIncreaseSP = await this.skillGainValidation.canUpdateSkills(character, skills as ISkill, "shielding");

      if (!canIncreaseSP) {
        return;
      }

      const result = this.increaseSP(skills, ItemSubType.Shield) as IIncreaseSPResult;

      const isMultipleOfTen = result.skillLevelAfter % 10 === 0;
      if (result.skillLevelUp && isMultipleOfTen) {
        const message = this.discordBot.getRandomLevelUpMessage(
          character.name,
          result.skillLevelAfter,
          result.skillName
        );
        const channel = "achievements";
        const title = "Skill Level Up!";

        await this.discordBot.sendMessageWithColor(message, channel, title);
      }

      await this.skillFunctions.updateSkills(skills, character);

      if (!_.isEmpty(result)) {
        if (result.skillLevelUp && character.channelId) {
          await this.skillFunctions.sendSkillLevelUpEvents(result, character);
        }

        await this.characterBonusPenalties.applyRaceBonusPenalties(character, ItemSubType.Shield);
      }
    } catch (error) {
      console.error(error);
    } finally {
      await this.sendSkillLevelUpEvents(character);
    }
  }

  @TrackNewRelicTransaction()
  public async increaseMagicSP(character: ICharacter, power: number): Promise<void> {
    await this.increaseBasicAttributeSP(
      character,
      BasicAttribute.Magic,
      this.getMagicSkillIncreaseCalculator(power, character.class as CharacterClass, true)
    );
  }

  @TrackNewRelicTransaction()
  public async increaseMagicResistanceSP(character: ICharacter, power: number): Promise<void> {
    await this.increaseBasicAttributeSP(
      character,
      BasicAttribute.MagicResistance,
      this.getMagicSkillIncreaseCalculator(power, character.class as CharacterClass, false)
    );
  }

  @TrackNewRelicTransaction()
  public async increaseBasicAttributeSP(
    character: ICharacter,
    attribute: BasicAttribute,
    skillPointsCalculator?: Function
  ): Promise<void> {
    try {
      if (!character.skills) {
        throw new Error(`skills not found for character ${character.id}`);
      }

      const skills = await this.fetchCharacterSkills(character);

      if (!skills) {
        throw new Error(`skills not found for character ${character.id}`);
      }

      const canIncreaseSP = await this.skillGainValidation.canUpdateSkills(character, skills as ISkill, attribute);

      if (!canIncreaseSP) {
        return;
      }

      const result = this.increaseSP(skills, attribute, skillPointsCalculator);

      if (!result) {
        throw new Error(`increaseSP result not found for character ${character.id}`);
      }

      await this.skillFunctions.updateSkills(skills, character);

      if (result.skillLevelUp && character.channelId) {
        // If BasicAttribute(except dexterity) level up we clean the data from Redis
        if (attribute !== BasicAttribute.Dexterity && skills.owner) {
          await this.inMemoryHashTable.delete(skills.owner.toString(), "totalAttack");
          await this.inMemoryHashTable.delete(skills.owner.toString(), "totalDefense");
        }

        await this.skillFunctions.sendSkillLevelUpEvents(result, character);

        const isMultipleOfTen = result.skillLevelAfter % 10 === 0;
        if (isMultipleOfTen) {
          const message = this.discordBot.getRandomLevelUpMessage(
            character.name,
            result.skillLevelAfter,
            result.skillName
          );
          const channel = "achievements";
          const title = "Skill Level Up!";

          await this.discordBot.sendMessageWithColor(message, channel, title);
        }
      }

      await this.characterBonusPenalties.applyRaceBonusPenalties(character, attribute);
    } catch (error) {
      console.error(error);
    } finally {
      await this.sendSkillLevelUpEvents(character);
    }
  }

  @TrackNewRelicTransaction()
  public async increaseCraftingSP(character: ICharacter, craftedItemKey: string, isSuccess: boolean): Promise<void> {
    try {
      const skillToUpdate = this.skillMapper.getCraftingSkillToUpdate(craftedItemKey);

      if (!skillToUpdate) {
        throw new Error(`skill not found for item ${craftedItemKey}`);
      }

      // eslint-disable-next-line mongoose-lean/require-lean
      const skills = (await Skill.findById(character.skills)) as unknown as ISkill;
      if (!skills) {
        throw new Error(`skills not found for character ${character.id}`);
      }

      const canIncreaseSP = await this.skillGainValidation.canUpdateSkills(character, skills as ISkill, skillToUpdate);

      if (!canIncreaseSP) {
        return;
      }

      const craftSkillPointsCalculator = (skillDetails: ISkillDetails): number => {
        return this.calculateNewCraftSP(skillDetails);
      };

      const result = this.increaseSP(skills, craftedItemKey, craftSkillPointsCalculator, CraftingSkillsMap);
      await this.skillFunctions.updateSkills(skills, character);

      await this.characterBonusPenalties.applyRaceBonusPenalties(character, skillToUpdate);

      if (!result) {
        throw new Error(`increaseSP result not found for character ${character.id}`);
      }

      if (result.skillLevelUp && character.channelId) {
        await this.skillFunctions.sendSkillLevelUpEvents(result, character);
      }
    } catch (error) {
      console.error(error);
    } finally {
      await this.sendSkillLevelUpEvents(character);
    }
  }

  @TrackNewRelicTransaction()
  private async fetchCharacterSkills(character: ICharacter): Promise<ISkill | undefined> {
    try {
      const skills = (await Skill.findById(character.skills)
        .lean({ virtuals: true, defaults: true })
        .cacheQuery({ cacheKey: `${character._id}-skills` })) as unknown as ISkill;

      if (!skills) {
        throw new Error(`skills not found for character ${character.id}`);
      }

      return skills;
    } catch (error) {
      console.error(error);
    }
  }

  private async sendSkillLevelUpEvents(character: ICharacter): Promise<void> {
    // send skill update event
    const [buffedSkills, buffs] = await Promise.all([
      this.skillBuff.getSkillsWithBuff(character),
      this.characterBuffSkill.calculateAllActiveBuffs(character),
    ]);
    this.socketMessaging.sendEventToUser(character.channelId!, SkillSocketEvents.ReadInfo, {
      skill: buffedSkills,
      buffs,
    });
  }

  private increaseSP(
    skills: ISkill,
    skillKey: string,
    skillPointsCalculator?: Function,
    skillsMap: Map<string, string> = SKILLS_MAP,
    bonus?: number
  ): IIncreaseSPResult | undefined {
    try {
      if (typeof skillKey !== "string" || !skillKey.trim()) {
        throw new Error(`Invalid or empty skillKey provided: ${skillKey}`);
      }

      let skillLevelUp = false;
      const skillToUpdate = skillsMap.get(skillKey) ?? this.skillMapper.getCraftingSkillToUpdate(skillKey);

      if (!skillToUpdate) {
        throw new Error(`Skill not found for item subtype ${skillKey}`);
      }

      if (!skills[skillToUpdate]) {
        throw new Error(`Skill details not found for key ${skillToUpdate}`);
      }

      if (!skillPointsCalculator) {
        skillPointsCalculator = (skillDetails: ISkillDetails, bonus?: number): number => {
          const newSP = this.calculateNewSP(skillDetails, bonus);
          if (!newSP) {
            throw new Error(`newSP not found for skill ${skillKey}`);
          }
          return newSP;
        };
      }

      const updatedSkillDetails = skills[skillToUpdate] as ISkillDetails;

      updatedSkillDetails.skillPoints = skillPointsCalculator(updatedSkillDetails, bonus);
      updatedSkillDetails.skillPointsToNextLevel = this.skillCalculator.calculateSPToNextLevel(
        updatedSkillDetails.skillPoints,
        updatedSkillDetails.level + 1
      );

      if (updatedSkillDetails.skillPointsToNextLevel <= 0) {
        skillLevelUp = true;
        updatedSkillDetails.level++;
        updatedSkillDetails.skillPointsToNextLevel = this.skillCalculator.calculateSPToNextLevel(
          updatedSkillDetails.skillPoints,
          updatedSkillDetails.level + 1
        );
        this.newRelic.trackMetric(
          NewRelicMetricCategory.Count,
          NewRelicSubCategory.Characters,
          `${skillToUpdate}-SkillUp`,
          1
        );
      }

      skills[skillToUpdate] = updatedSkillDetails;

      return {
        skillName: skillToUpdate,
        skillLevelBefore: this.numberFormatter.formatNumber(updatedSkillDetails.level - 1),
        skillLevelAfter: this.numberFormatter.formatNumber(updatedSkillDetails.level),
        skillLevelUp,
        skillPoints: Math.round(updatedSkillDetails.skillPoints),
        skillPointsToNextLevel: Math.round(updatedSkillDetails.skillPointsToNextLevel),
      };
    } catch (error) {
      console.error(`Error in increaseSP for skillKey ${skillKey}:`, error);
    }
  }

  private ensureMinimumSP(skills: ISkill): void {
    Object.keys(skills).forEach((skillKey) => {
      const skillDetails = skills[skillKey] as ISkillDetails;

      // Skip the check for level 0
      if (skillDetails.level === 0 || skillDetails.level === 1) {
        return;
      }

      const minimumSP = this.skillCalculator.getSPForLevel(skillDetails.level);

      if (skillDetails.skillPoints < minimumSP) {
        console.warn(
          `Skill ${skillKey} for character ${skills.owner} has SP ${skillDetails.skillPoints} which is less than the minimum ${minimumSP} for level ${skillDetails.level}. Adjusting...`
        );
        skillDetails.skillPoints = minimumSP;
      }
    });
  }

  private calculateNewSP(skillDetails: ISkillDetails, bonus?: number): number | undefined {
    try {
      if (!skillDetails) {
        throw new Error("skillDetails is undefined");
      }

      let spIncreaseRatio = SP_INCREASE_BASE;

      if (skillDetails.level < 10) {
        spIncreaseRatio += LOW_SKILL_LEVEL_SP_INCREASE_BONUS;
      }

      if (typeof bonus === "number") {
        spIncreaseRatio += bonus;
      }
      return Math.round((skillDetails.skillPoints + spIncreaseRatio) * 100) / 100;
    } catch (error) {
      console.error("Error in calculateNewSP:", error);
    }
  }

  private calculateNewCraftSP(skillDetails: ISkillDetails): number {
    return Math.round((skillDetails.skillPoints + SP_CRAFTING_INCREASE_RATIO) * 100) / 100;
  }

  private getMagicSkillIncreaseCalculator(
    spellPower: number,
    characterClass: CharacterClass,
    isMagicLevelIncrease: boolean = true
  ): Function | undefined {
    try {
      // mages should increase ML faster

      let ratio = 1;

      if (isMagicLevelIncrease) {
        switch (characterClass) {
          case CharacterClass.Druid:
          case CharacterClass.Sorcerer:
            ratio = ML_INCREASE_RATIO_MAGE;
            break;
          default:
            ratio = ML_INCREASE_RATIO_OTHERS;

            break;
        }
      }

      return ((power: number, skillDetails: ISkillDetails): number => {
        const manaSp = Math.round((spellPower * ratio + power) * SP_MAGIC_INCREASE_TIMES_MANA * 100) / 100;
        return (this.calculateNewSP(skillDetails) ?? 0) + manaSp * ratio;
      }).bind(this, spellPower);
    } catch (error) {
      console.error(error);
    }
  }
}
