import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ICharacterParty } from "@entities/ModuleCharacter/CharacterPartyModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { CharacterView } from "@providers/character/CharacterView";
import { CharacterBuffSkill } from "@providers/character/characterBuff/CharacterBuffSkill";
import { NPC_GIANT_FORM_EXPERIENCE_MULTIPLIER } from "@providers/constants/NPCConstants";
import { MODE_EXP_MULTIPLIER } from "@providers/constants/SkillConstants";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { spellLearn } from "@providers/inversify/container";
import { Locker } from "@providers/locks/Locker";
import PartyManagement from "@providers/party/PartyManagement";
import { SkillBuff } from "@providers/skill/SkillBuff";
import { SkillCalculator } from "@providers/skill/SkillCalculator";
import { SkillFunctions } from "@providers/skill/SkillFunctions";
import { SkillStatsIncrease } from "@providers/skill/SkillStatsIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NumberFormatter } from "@providers/text/NumberFormatter";
import { Time } from "@providers/time/Time";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import {
  AnimationEffectKeys,
  CharacterPartyBenefits,
  CharacterSocketEvents,
  DisplayTextSocketEvents,
  EntityType,
  ICharacterAttributeChanged,
  IDisplayTextEvent,
  IIncreaseXPResult,
  ILevelUpFromServer,
  IUIShowMessage,
  Modes,
  SkillEventType,
  SkillSocketEvents,
  UISocketEvents,
} from "@rpg-engine/shared";
import { Colors } from "discord.js";

import { provide } from "inversify-binding-decorators";

import { CharacterPremiumAccount } from "@providers/character/CharacterPremiumAccount";
import random from "lodash/random";
import uniqBy from "lodash/uniqBy";
import { Types } from "mongoose";
import { clearCacheForKey } from "speedgoose";
import { v4 as uuidv4 } from "uuid";
import { NPCExperienceLimiter } from "./NPCExperienceLimiter";

@provide(NPCExperience)
export class NPCExperience {
  constructor(
    private skillCalculator: SkillCalculator,
    private skillFunctions: SkillFunctions,
    private socketMessaging: SocketMessaging,
    private numberFormatter: NumberFormatter,
    private characterBuffSkill: CharacterBuffSkill,
    private skillBuff: SkillBuff,
    private characterView: CharacterView,
    private animationEffect: AnimationEffect,
    private time: Time,
    private skillLvUpStatsIncrease: SkillStatsIncrease,
    private locker: Locker,
    private partyManagement: PartyManagement,
    private newRelic: NewRelic,
    private discordBot: DiscordBot,
    private experienceLimiter: NPCExperienceLimiter,
    private characterPremiumAccount: CharacterPremiumAccount
  ) {}

  /**
   * This function distributes
   * the xp stored in the xpToRelease array to the corresponding
   * characters and notifies them if leveled up
   */
  @TrackNewRelicTransaction()
  public async releaseXP(target: INPC): Promise<void> {
    // matches both melee and magic battle companions
    // do not give XP for battle companions
    if ((target as INPC).key.includes("battle-companion")) {
      return;
    }

    await this.time.waitForMilliseconds(random(10, 40)); // add artificial delay to avoid concurrency

    const hasLock = await this.locker.lock(`npc-${target._id.toString()}-release-xp`);

    if (!hasLock) {
      return;
    }

    // The xp gained is released once the NPC dies.
    // Store the xp in the xpToRelease array
    // before adding the character to the array, check if the character already caused some damage

    console.log("TARGET EXP", target.experience);

    target.xpToRelease = uniqBy(target.xpToRelease, "xpId");
    console.log("EXP RELEASED", target.xpToRelease);

    // compare if EXP collected is equal to EXP of mob, if not add EXP
    // if (target.xpToRelease.xp !== target.experience && ) {
    //   target.xpToRelease.xp = target.experience;
    // }

    while (target.xpToRelease.length > 0) {
      const record = target.xpToRelease.shift();
      const characterAndSkills = await this.validateCharacterAndSkills(record!.charId);

      if (!characterAndSkills) {
        continue;
      }

      const character = (await Character.findById(record!.charId).lean({
        virtuals: true,
        defaults: true,
      })) as ICharacter;

      if (!character) {
        return this.releaseXP(target);
      }

      const expMultiplier = await this.getXPMultiplier(character, target);

      let baseExp = record!.xp * expMultiplier;
      let expRecipients: Types.ObjectId[] = [];

      if (record!.partyId) {
        const party = await this.partyManagement.getPartyByCharacterId(characterAndSkills.character._id);

        if (!party) {
          continue;
        }

        const partyBenefit = party.benefits?.find((benefits) => benefits.benefit === CharacterPartyBenefits.Experience);

        baseExp += partyBenefit ? (baseExp * partyBenefit.value) / 100 : 0;
        expRecipients = [...party.members.map((member) => member._id), party.leader._id];
      } else {
        expRecipients.push(record!.charId);
      }

      const charactersInRange = await this.partyManagement.isWithinRange(target, expRecipients, 150);

      if (charactersInRange.size === 0) {
        continue;
      }

      const expPerRecipient = Number((baseExp / charactersInRange.size ?? 1).toFixed(2));

      for (const characterInRange of charactersInRange) {
        const recipientCharacterAndSkills = await this.validateCharacterAndSkills(characterInRange);

        if (!recipientCharacterAndSkills) {
          continue;
        }

        await this.updateSkillsAndSendEvents(
          recipientCharacterAndSkills.character,
          recipientCharacterAndSkills.skills,
          expPerRecipient,
          target
        );
      }
    }

    await NPC.updateOne({ _id: target._id }, { xpToRelease: target.xpToRelease });
  }

  /**
   * Calculates the xp gained by a character every time it causes damage in battle
   * In case the target is NPC, it stores the character's xp gained in the xpToRelease array
   */

  @TrackNewRelicTransaction()
  public async recordXPinBattle(attacker: ICharacter, target: ICharacter | INPC, damage: number): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`npc-${target._id.toString()}-record-xp`);
      console.log("canProceed", canProceed);
      if (!canProceed) {
        return;
      }

      const skill = await Skill.findOne({ _id: attacker.skills });
      console.log("ATTACKER TOTAL EXP", skill?.experience);
      // For now, only supported increasing XP when target is NPC
      if (target.type === EntityType.NPC && damage > 0) {
        // ensure that xpPerDamage is not undefined since u just need calculate EXP / MAX HEALTH
        if (target.xpPerDamage === undefined) {
          target.xpPerDamage = target.experience / target.maxHealth;
        }
        // matches both melee and magic battle companions
        // do not give XP for battle companions
        if ((target as INPC).key.includes("battle-companion")) {
          return;
        }
        console.log("target.experience", target.experience);
        console.log("target.health", target.health);
        console.log("target.isAlive", target.isAlive);
        console.log("attacker._id", attacker._id);
        console.log("attacker._id -> TYPEOF -> _ID", typeof attacker._id);
        console.log("attacker.id", attacker.id);
        console.log("attacker.id -> TYPEOF -> ID", typeof attacker.id);

        target = target as INPC;
        target.xpToRelease = uniqBy(target.xpToRelease, "xpId");
        console.log("GET target.xpToRelease uniqBy xpId", target.xpToRelease);
        console.log("target.xpPerDamage", target.xpPerDamage);
        console.log("damage", damage);
        const party = (await this.partyManagement.getPartyByCharacterId(attacker._id)) as ICharacterParty;
        console.log("party", party);
        // Store the xp in the xpToRelease array
        // before adding the character to the array, check if the character already caused some damage
        if (typeof target.xpToRelease !== "undefined") {
          let found = false;

          for (const i in target.xpToRelease) {
            // console.log("target.xpToRelease[i].partyId?.toString()", target.xpToRelease[i].partyId?.toString())
            // console.log("party._id", party._id)
            console.log("target.xpToRelease[i].charId?.toString()", target.xpToRelease[i].charId?.toString());
            console.log("attacker._id", attacker._id);
            console.log(
              "target.xpToRelease[i].charId === attacker._id -> _ID CONVERSAO CHARID",
              target.xpToRelease[i].charId?.toString() === attacker._id.toString()
            );

            const xpCondition = party
              ? target.xpToRelease[i].partyId?.toString() === party._id.toString()
              : target.xpToRelease[i].charId?.toString() === attacker._id.toString();

            if (xpCondition) {
              found = true;
              console.log("target.xpToRelease[i].xp BEFORE", target.xpToRelease[i].xp);
              target.xpToRelease[i].xp! += target.xpPerDamage * damage;
              console.log("target.xpToRelease[i].xp AFTER", target.xpToRelease[i].xp);
              break;
            }
          }

          if (!found) {
            target.xpToRelease.push({
              xpId: uuidv4(),
              charId: attacker._id,
              partyId: party ? party._id : null, // can be null if the attacker is not in a party
              xp: target.xpPerDamage * damage,
            });
          }
        } else {
          target.xpToRelease = [
            {
              xpId: uuidv4(),
              charId: attacker._id,
              partyId: party ? party._id : null, // can be null if the attacker is not in a party
              xp: target.xpPerDamage * damage,
            },
          ];
        }

        console.log("BEFORE isXpInRage -> target.xpToRelease", target.xpToRelease);

        const isXpInRange = this.experienceLimiter.isXpInRange(target);
        console.log("isXpInRange", isXpInRange);

        if (isXpInRange) {
          await NPC.updateOne({ _id: target._id }, { xpToRelease: target.xpToRelease });
        } else {
          // E.g. if a creature has 800 experience and last but one xpToRelease has 700 accumulated
          // and the last xpToRelease has 850 and when you make isXpInRange compare it will be false
          // because 850 is bigger than 800, so last but one xpToRelease will be returned with 700.
          // The player has "lost" 100 exp, this validation fixes this behavior.
          target = this.experienceLimiter.compareAndProcessRightEXP(target);
          console.log("NEW FIXED EXP IS:", target.xpToRelease);

          await NPC.updateOne({ _id: target._id }, { xpToRelease: target.xpToRelease });
        }

        console.log("isXpInRange HOW MUCH EXP TO RELEASE?", target.xpToRelease);
      }
    } catch (error) {
      console.error(error);
      await this.locker.unlock(`npc-${target._id.toString()}-record-xp`);
    } finally {
      await this.locker.unlock(`npc-${target._id.toString()}-record-xp`);
    }
  }

  private async getXPMultiplier(character: ICharacter, target: INPC): Promise<number> {
    const premiumAccountData = await this.characterPremiumAccount.getPremiumAccountData(character);
    const premiumAccountXPMultiplier = premiumAccountData ? premiumAccountData.XPBuff / 100 + 1 : 1;
    const characterMode: Modes = Object.values(Modes).find((mode) => mode === character.mode) ?? Modes.SoftMode;
    const giantNPCMultiplier = target.isGiantForm ? NPC_GIANT_FORM_EXPERIENCE_MULTIPLIER : 1;
    const characterModeMultiplier = MODE_EXP_MULTIPLIER[characterMode];

    return giantNPCMultiplier * characterModeMultiplier * premiumAccountXPMultiplier;
  }

  private async sendExpLevelUpEvents(
    expData: IIncreaseXPResult,
    character: ICharacter,
    target: INPC | ICharacter
  ): Promise<void> {
    const previousLevel = expData.level - 1;

    if (previousLevel === 0) {
      return;
    }

    await this.bootHPAndManaOnLevelUp(character);

    const formattedPreviousLevel = this.numberFormatter.formatNumber(previousLevel);
    const formattedCurrentLevel = this.numberFormatter.formatNumber(expData.level);

    this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
      message: `You advanced from level ${formattedPreviousLevel} to level ${formattedCurrentLevel}.`,
      type: "info",
    });

    this.socketMessaging.sendEventToUser<ILevelUpFromServer>(character.channelId!, SkillSocketEvents.LevelUp, {
      previousLevel: formattedPreviousLevel,
      currentLevel: formattedCurrentLevel,
    });

    const payload = {
      characterId: character._id.toString(),
      eventType: SkillEventType.LevelUp,
    };

    this.socketMessaging.sendEventToUser(character.channelId!, SkillSocketEvents.SkillGain, payload);
    await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.LevelUp);

    await this.socketMessaging.sendEventToCharactersAroundCharacter(character, SkillSocketEvents.SkillGain, payload);
  }

  private async bootHPAndManaOnLevelUp(character: ICharacter): Promise<void> {
    const updatedCharacter = await Character.findById(character._id).lean().select("maxHealth maxMana");

    if (!updatedCharacter) {
      throw new Error(`Character ${character._id.toString()} not found.`);
    }

    await Character.updateOne(
      {
        _id: character._id.toString(),
      },
      {
        $set: {
          health: updatedCharacter.maxHealth,
          mana: updatedCharacter.maxMana,
        },
      }
    );

    const HPManaBoostPayload: ICharacterAttributeChanged = {
      targetId: character._id.toString(),
      health: updatedCharacter.maxHealth,
      mana: updatedCharacter.maxMana,
    };

    await this.socketMessaging.sendEventToCharactersAroundCharacter(
      character,
      CharacterSocketEvents.AttributeChanged,
      HPManaBoostPayload,
      true
    );
  }

  private async warnCharactersAroundAboutExpGains(character: ICharacter, exp: number): Promise<void> {
    const levelUpEventPayload: IDisplayTextEvent = {
      targetId: character._id.toString(),
      value: exp,
      prefix: "+",
    };

    const nearbyCharacters = await this.characterView.getCharactersInView(character);

    for (const nearbyCharacter of nearbyCharacters) {
      this.socketMessaging.sendEventToUser<IDisplayTextEvent>(
        nearbyCharacter.channelId!,
        DisplayTextSocketEvents.DisplayText,
        levelUpEventPayload
      );
    }

    // warn character about his experience gain
    this.socketMessaging.sendEventToUser<IDisplayTextEvent>(
      character.channelId!,
      DisplayTextSocketEvents.DisplayText,
      levelUpEventPayload
    );

    const skill = await this.skillBuff.getSkillsWithBuff(character);
    const buffs = await this.characterBuffSkill.calculateAllActiveBuffs(character);

    this.socketMessaging.sendEventToUser(character.channelId!, SkillSocketEvents.ReadInfo, {
      skill,
      buffs,
    });
  }

  private async validateCharacterAndSkills(id: Types.ObjectId): Promise<{
    character: ICharacter;
    skills: ISkill;
  } | null> {
    const character = (await Character.findById(id).lean({
      virtuals: true,
      defaults: true,
    })) as ICharacter;

    if (!character) {
      return null;
    }

    await clearCacheForKey(`characterBuffs_${character._id.toString()}`);
    // Get character skills
    const skills = (await Skill.findById(character.skills)
      .lean()
      .cacheQuery({
        cacheKey: `${character._id.toString()}-skills`,
      })) as ISkill;
    if (!skills) {
      return null;
    }

    return { character, skills };
  }

  private async updateSkillsAndSendEvents(
    character: ICharacter,
    skills: ISkill,
    exp: number,
    target: INPC
  ): Promise<void> {
    let levelUp = false;
    let previousLevel = 0;

    skills.experience += exp;
    skills.xpToNextLevel = this.skillCalculator.calculateXPToNextLevel(skills.experience, skills.level + 1);

    while (skills.xpToNextLevel <= 0) {
      if (previousLevel === 0) {
        previousLevel = skills.level;
      }
      skills.level++;
      skills.xpToNextLevel = this.skillCalculator.calculateXPToNextLevel(skills.experience, skills.level + 1);
      levelUp = true;
    }

    await this.skillFunctions.updateSkills(skills, character);

    if (levelUp) {
      await this.skillLvUpStatsIncrease.increaseMaxManaMaxHealth(character._id);
      await this.sendExpLevelUpEvents({ level: skills.level, previousLevel, exp }, character, target);
      setTimeout(async () => {
        // importing directly to avoid circular dependency issues. Good luck trying to solve.
        await spellLearn.learnLatestSkillLevelSpells(character._id, true);
      }, 5000);

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Characters,
        `${character.class}-LevelUp`,
        1
      );

      const isMultipleOfTen = skills.level % 10 === 0;

      if (isMultipleOfTen) {
        const message = this.discordBot.getRandomLevelUpMessage(character.name, skills.level, "Level");
        const channel = "achievements";
        const title = "Character Level UP!";
        const color = Colors.DarkRed;
        await this.discordBot.sendMessageWithColor(message, channel, title, color);
      }
    }

    await this.warnCharactersAroundAboutExpGains(character, exp);
  }
}
