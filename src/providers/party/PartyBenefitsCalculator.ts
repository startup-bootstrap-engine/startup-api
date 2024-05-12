import { PARTY_BONUS_RATIO } from "@providers/constants/PartyConstants";
import {
  CharacterPartyBenefits,
  CharacterPartyDistributionBonus,
  CharacterPartyDropBonus,
  CharacterPartyEXPBonus,
  CharacterPartySkillBonus,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(PartyBenefitsCalculator)
export class PartyBenefitsCalculator {
  public calculatePartyBenefits(
    numberOfMembers: number,
    differentClasses: number
  ): { benefit: CharacterPartyBenefits; value: number }[] {
    const bonusMapping = this.getBonusMapping(numberOfMembers);
    const experienceBonus = this.getExperienceBonus(differentClasses);

    return [
      {
        benefit: CharacterPartyBenefits.Distribution,
        value: bonusMapping.distribution * PARTY_BONUS_RATIO,
      },
      {
        benefit: CharacterPartyBenefits.Experience,
        value: experienceBonus * PARTY_BONUS_RATIO,
      },
      {
        benefit: CharacterPartyBenefits.DropRatio,
        value: bonusMapping.dropRatio * PARTY_BONUS_RATIO,
      },
      {
        benefit: CharacterPartyBenefits.Skill,
        value: bonusMapping.skill * PARTY_BONUS_RATIO,
      },
    ];
  }

  private getBonusMapping(numberOfMembers: number): {
    distribution: CharacterPartyDistributionBonus;
    dropRatio: CharacterPartyDropBonus;
    skill: CharacterPartySkillBonus;
  } {
    switch (numberOfMembers) {
      case 2:
        return {
          distribution: CharacterPartyDistributionBonus.Two,
          dropRatio: CharacterPartyDropBonus.Two,
          skill: CharacterPartySkillBonus.Two,
        };
      case 3:
        return {
          distribution: CharacterPartyDistributionBonus.Three,
          dropRatio: CharacterPartyDropBonus.Three,
          skill: CharacterPartySkillBonus.Three,
        };
      case 4:
        return {
          distribution: CharacterPartyDistributionBonus.Four,
          dropRatio: CharacterPartyDropBonus.Four,
          skill: CharacterPartySkillBonus.Four,
        };
      case 5:
        return {
          distribution: CharacterPartyDistributionBonus.Five,
          dropRatio: CharacterPartyDropBonus.Five,
          skill: CharacterPartySkillBonus.Five,
        };
      default:
        return {
          distribution: CharacterPartyDistributionBonus.None,
          dropRatio: CharacterPartyDropBonus.None,
          skill: CharacterPartySkillBonus.None,
        };
    }
  }

  private getExperienceBonus(differentClasses: number): CharacterPartyEXPBonus {
    switch (differentClasses) {
      case 1:
        return CharacterPartyEXPBonus.One;
      case 2:
        return CharacterPartyEXPBonus.Two;
      case 3:
        return CharacterPartyEXPBonus.Three;
      case 4:
        return CharacterPartyEXPBonus.Four;
      case 5:
        return CharacterPartyEXPBonus.Five;
      default:
        return CharacterPartyEXPBonus.One;
    }
  }
}
