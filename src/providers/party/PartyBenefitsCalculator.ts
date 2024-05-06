import { PARTY_BONUS_RATIO } from "@providers/constants/PartyConstants";
import {
  CharacterPartyBenefits,
  CharacterPartyDistributionBonus,
  CharacterPartyDropBonus,
  CharacterPartyEXPBonus,
  CharacterPartySkillBonus,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";

@provide(PartyBenefitsCalculator)
export class PartyBenefitsCalculator {
  public calculatePartyBenefits(
    numberOfMembers: number,
    differentClasses: number
  ): { benefit: CharacterPartyBenefits; value: number }[] {
    const bonusMapping = {
      2: {
        distribution: CharacterPartyDistributionBonus.Two,
        dropRatio: CharacterPartyDropBonus.Two,
        skill: CharacterPartySkillBonus.Two,
      },
      3: {
        distribution: CharacterPartyDistributionBonus.Three,
        dropRatio: CharacterPartyDropBonus.Three,
        skill: CharacterPartySkillBonus.Three,
      },
      4: {
        distribution: CharacterPartyDistributionBonus.Four,
        dropRatio: CharacterPartyDropBonus.Four,
        skill: CharacterPartySkillBonus.Four,
      },
      5: {
        distribution: CharacterPartyDistributionBonus.Five,
        dropRatio: CharacterPartyDropBonus.Five,
        skill: CharacterPartySkillBonus.Five,
      },
    };

    const defaultBonus = {
      distribution: CharacterPartyDistributionBonus.None,
      dropRatio: CharacterPartyDropBonus.None,
      skill: CharacterPartySkillBonus.None,
    };

    const bonuses = _.get(bonusMapping, numberOfMembers, defaultBonus);

    const distributionBonus = bonuses.distribution;
    const dropRatioBonus = bonuses.dropRatio;
    const skillBonus = bonuses.skill;

    const expBonusMapping = {
      1: CharacterPartyEXPBonus.One,
      2: CharacterPartyEXPBonus.Two,
      3: CharacterPartyEXPBonus.Three,
      4: CharacterPartyEXPBonus.Four,
      5: CharacterPartyEXPBonus.Five,
    };

    const experienceBonus = _.get(expBonusMapping, differentClasses, CharacterPartyEXPBonus.One);

    return [
      {
        benefit: CharacterPartyBenefits.Distribution,
        value: distributionBonus * PARTY_BONUS_RATIO,
      },
      {
        benefit: CharacterPartyBenefits.Experience,
        value: experienceBonus * PARTY_BONUS_RATIO,
      },
      {
        benefit: CharacterPartyBenefits.DropRatio,
        value: dropRatioBonus * PARTY_BONUS_RATIO,
      },
      {
        benefit: CharacterPartyBenefits.Skill,
        value: skillBonus * PARTY_BONUS_RATIO,
      },
    ];
  }
}
