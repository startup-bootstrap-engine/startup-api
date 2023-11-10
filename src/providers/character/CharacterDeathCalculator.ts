import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INVENTORY_DROP_CHANCE_MULTIPLIER, SKILL_LOSS_ON_DEATH_MULTIPLIER } from "@providers/constants/DeathConstants";
import {
  PREMIUM_ACCOUNT_INVENTORY_DROP_RATIO,
  PREMIUM_ACCOUNT_SKILL_LOSS_RATIO,
} from "@providers/constants/PremiumAccountConstants";
import { provide } from "inversify-binding-decorators";
import { CharacterPremiumAccount } from "./CharacterPremiumAccount";

@provide(CharacterDeathCalculator)
export class CharacterDeathCalculator {
  constructor(private characterPremiumAccount: CharacterPremiumAccount) {}

  public async calculateSkillAndXPLoss(skills: ISkill, multiply = 1): Promise<number> {
    if (!skills.owner) {
      skills = (await Skill.findOne({ _id: skills._id }).lean()) as ISkill;
    }

    const isPremiumAccount = await this.characterPremiumAccount.isPremiumAccount(String(skills.owner));

    // Define the XP/SP loss based on character level
    const skillLossPercentageLevel = {
      5: 0,
      8: 2,
      10: 3,
      12: 4,
      14: 5,
      16: 6,
      18: 8,
      20: 10,
    };

    const level = skills.level;

    for (const [threshold, xpLoss] of Object.entries(skillLossPercentageLevel)) {
      if (level <= Number(threshold)) {
        const XPLossResult = xpLoss * multiply * SKILL_LOSS_ON_DEATH_MULTIPLIER;

        if (isPremiumAccount) {
          return XPLossResult * PREMIUM_ACCOUNT_SKILL_LOSS_RATIO;
        }

        return XPLossResult;
      }
    }

    const regularSkillLoss = 10 * SKILL_LOSS_ON_DEATH_MULTIPLIER;

    if (isPremiumAccount) {
      return regularSkillLoss * PREMIUM_ACCOUNT_SKILL_LOSS_RATIO;
    }

    return regularSkillLoss;
  }

  public async calculateInventoryDropChance(skills: ISkill): Promise<number> {
    if (!skills.owner) {
      skills = (await Skill.findOne({ _id: skills._id }).lean()) as ISkill;
    }

    const isPremiumAccount = await this.characterPremiumAccount.isPremiumAccount(String(skills.owner));

    // Define the chances of dropping inventory based on character level
    const chancesByLevel = {
      5: 0,
      8: 5,
      10: 10,
      12: 15,
      14: 20,
      16: 25,
      18: 35,
      20: 45,
      22: 55,
      24: 65,
      26: 75,
      28: 85,
      30: 95,
      32: 100,
    };

    // Get the character's level
    const level = skills.level;

    for (const [threshold, chance] of Object.entries(chancesByLevel)) {
      // Return the chance of dropping inventory if the character's level is below the current threshold
      if (level <= Number(threshold)) {
        const regularChance = chance * INVENTORY_DROP_CHANCE_MULTIPLIER;

        if (isPremiumAccount) {
          return regularChance * PREMIUM_ACCOUNT_INVENTORY_DROP_RATIO;
        }

        return regularChance;
      }
    }

    const regularChance = 100 * INVENTORY_DROP_CHANCE_MULTIPLIER;

    if (isPremiumAccount) {
      return regularChance * PREMIUM_ACCOUNT_INVENTORY_DROP_RATIO;
    }

    // Return the maximum chance of dropping inventory if the character's level is above the highest threshold
    return regularChance;
  }
}
