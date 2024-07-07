import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import {
  BASE_SPEED_MAX_LEVEL_THRESHOLD,
  BASE_SPEED_MIN_LEVEL_THRESHOLD,
} from "@providers/constants/CharacterSpeedConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { IPremiumAccountData } from "@providers/constants/PremiumAccountConstants";
import { LinearInterpolation } from "@providers/math/LinearInterpolation";
import { NumberFormatter } from "@providers/text/NumberFormatter";
import { CharacterAttributes } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterPremiumAccount } from "../CharacterPremiumAccount";
import { CharacterBuffSkill } from "../characterBuff/CharacterBuffSkill";

@provide(CharacterBaseSpeed)
export class CharacterBaseSpeed {
  constructor(
    private characterBuffSkill: CharacterBuffSkill,
    private linearInterpolation: LinearInterpolation,
    private numberFormatter: NumberFormatter,
    private characterPremiumAccount: CharacterPremiumAccount
  ) {}

  @TrackNewRelicTransaction()
  public async getBaseSpeed(character: ICharacter): Promise<number | undefined> {
    try {
      const skills = await Skill.findById(character.skills)
        .lean()
        .cacheQuery({ cacheKey: `${character._id}-skills` });

      if (!skills || typeof skills !== "object" || !("level" in skills)) {
        return undefined;
      }

      const level = skills.level;
      const buffs = await this.characterBuffSkill.calculateAllActiveBuffs(character);
      let baseSpeedBuffValue = 0; // Default value

      if (buffs) {
        // eslint-disable-next-line mongoose-lean/require-lean
        const baseSpeedBuff = buffs.find((buff) => buff.trait === CharacterAttributes.Speed);
        baseSpeedBuffValue = baseSpeedBuff?.absoluteChange || 0;
      }
      const premiumAccountData = await this.characterPremiumAccount.getPremiumAccountData(character);

      const rawCalculation = this.getRawBaseSpeed(level, premiumAccountData) + baseSpeedBuffValue;

      return this.numberFormatter.formatNumber(rawCalculation);
    } catch (error) {
      console.error("Error calculating base speed", error);
      return undefined;
    }
  }

  private getRawBaseSpeed(level: number, premiumAccountData: IPremiumAccountData | undefined): number {
    return this.linearInterpolation.calculateMultiPointInterpolation(
      level,
      [BASE_SPEED_MIN_LEVEL_THRESHOLD, BASE_SPEED_MAX_LEVEL_THRESHOLD],
      [MovementSpeed.Standard, premiumAccountData?.maxSpeed ?? MovementSpeed.Fast]
    );
  }
}
