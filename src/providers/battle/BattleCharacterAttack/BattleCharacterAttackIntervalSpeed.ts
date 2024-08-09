import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { CharacterClass } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(BattleCharacterAttackIntervalSpeed)
export class BattleCharacterAttackIntervalSpeed {
  private readonly maxReductionFactor = 0.8; // Max reduction percentage
  private readonly skillLevelReductionFactor = 0.01; // Skill level influences reduction by 1%
  private readonly originalSpeed = 1700; // Original speed before reduction
  private readonly minSpeed = 1360; // Minimum clamped speed after reduction

  public async tryReducingAttackIntervalSpeed(character: ICharacter): Promise<number> {
    if (character.class !== CharacterClass.Hunter) {
      return character.attackIntervalSpeed;
    }

    try {
      const skills = await Skill.findOne({ owner: character._id })
        .lean()
        .cacheQuery({
          cacheKey: `${character._id}-skills`,
        });

      if (!skills || skills.level === undefined) {
        return character.attackIntervalSpeed;
      }

      return this.calculateReducedSpeed(character.attackIntervalSpeed, skills.level);
    } catch (error) {
      console.error("Error retrieving skills or calculating attack interval speed:", error);
      return character.attackIntervalSpeed;
    }
  }

  private calculateReducedSpeed(attackIntervalSpeed: number, skillLevel: number): number {
    // Determine maximum skill level (assuming 100 for full reduction)
    const maxSkillLevel = 100;

    // Calculate the reduction percentage based on skill level, linearly scaling to max reduction factor
    const reductionPercentage = (skillLevel / maxSkillLevel) * this.maxReductionFactor;

    // Calculate the reduced speed linearly between the original speed and minimum speed
    const reducedSpeed = attackIntervalSpeed - (this.originalSpeed - this.minSpeed) * reductionPercentage;

    // Ensure the reduced speed doesn't fall below the minimum speed
    const clampedSpeed = Math.max(this.minSpeed, reducedSpeed);

    // Round the clamped speed to the nearest integer
    return Math.round(clampedSpeed);
  }
}
