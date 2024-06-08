import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import {
  ENTITY_EFFECT_DAMAGE_FROM_NPC_MODIFIER,
  ENTITY_EFFECT_DAMAGE_LEVEL_MULTIPLIER_NPC,
  ENTITY_EFFECT_DAMAGE_LEVEL_MULTIPLIER_PVP,
} from "@providers/constants/EntityEffectsConstants";
import { blueprintManager } from "@providers/inversify/container";
import { TraitGetter } from "@providers/skill/TraitGetter";
import { BasicAttribute, CharacterClass, EntityType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";

interface ICalculateDamageOptions {
  maxBonusDamage?: number;
  finalBonusDamage?: number;
}

@provide(CalculateEffectDamage)
export class CalculateEffectDamage {
  constructor(private skillGetter: TraitGetter) {}

  @TrackNewRelicTransaction()
  public async calculateEffectDamage(
    attacker: ICharacter | INPC,
    target: ICharacter | INPC,
    options?: ICalculateDamageOptions
  ): Promise<number> {
    const minRawDamage = 1;
    const minAttackerLevel = 1;
    try {
      let attackerSkills = attacker.skills as ISkill;

      if (!attackerSkills?.level) {
        attackerSkills = (await Skill.findById(target.skills)
          .lean({
            virtuals: true,
            defaults: true,
          })
          .cacheQuery({
            cacheKey: `${target._id}-skills`,
          })) as ISkill;
      }

      const attackerLevel = attackerSkills?.level ?? minAttackerLevel;

      const targetSkill = (await Skill.findById(target.skills)
        .lean({
          virtuals: true,
          defaults: true,
        })
        .cacheQuery({
          cacheKey: `${target._id}-skills`,
        })) as ISkill;

      const { resistanceLevel, magicResistanceLevel } = await this.getTargetResistances(targetSkill);

      const { attackerMagicLevel, attackerStrengthLevel } = await this.getAttackerMagicStrengthLevel(attackerSkills);

      const effectDamage = this.calculateTotalEffectDamage(
        attacker,
        attackerLevel,
        attackerStrengthLevel,
        attackerMagicLevel,
        minRawDamage,
        resistanceLevel,
        magicResistanceLevel,
        options
      );

      const modifier = attacker.type === EntityType.NPC ? ENTITY_EFFECT_DAMAGE_FROM_NPC_MODIFIER : 1;

      return effectDamage * modifier;
    } catch (err) {
      console.error(err);
      return minRawDamage;
    }
  }

  private calculateTotalEffectDamage(
    attacker: ICharacter | INPC,
    attackerLevel: number,
    attackerStrengthLevel: number,
    attackerMagicLevel: number,
    minRawDamage: number,
    resistanceLevel: number,
    magicResistanceLevel: number,
    options?: ICalculateDamageOptions
  ): number {
    const baseDamageSkillLevel = this.isMage(attacker) ? attackerMagicLevel : attackerStrengthLevel;

    let baseDamage;

    switch (attacker.type) {
      case EntityType.NPC:
        baseDamage = (attackerLevel + baseDamageSkillLevel) * ENTITY_EFFECT_DAMAGE_LEVEL_MULTIPLIER_NPC;
        break;
      case EntityType.Character:
        baseDamage = (attackerLevel + baseDamageSkillLevel) * ENTITY_EFFECT_DAMAGE_LEVEL_MULTIPLIER_PVP;
        break;
    }

    // Unified approach for calculating maxDamage
    const additionalDamage = this.getAdditionalDamage(attacker, attackerMagicLevel, attackerStrengthLevel);
    const maxDamage = Math.ceil(baseDamage + additionalDamage + (options?.maxBonusDamage ?? 0));

    // Min damage no longer relies on attackerLevel, making it constant
    const minDamage = minRawDamage;

    // Smoothing the random number generation using a weighted average
    const weight = 0.75; // Adjust the weight for smoothing effect (0.0 to 1.0)
    const averageDamage = (minDamage + maxDamage) / 2;
    const effectDamageRaw = weight * averageDamage + (1 - weight) * _.random(minDamage, maxDamage);
    const maxDefense = _.random(minRawDamage, resistanceLevel + magicResistanceLevel);

    // Final effect damage calculation
    const effectDamage = effectDamageRaw - maxDefense + (options?.finalBonusDamage ?? 0);

    return Math.max(effectDamage, minDamage);
  }

  private getAdditionalDamage(
    entity: ICharacter | INPC,
    attackerMagicLevel: number,
    attackerStrengthLevel: number
  ): number {
    let isMagicEntity: boolean;

    switch (entity.type) {
      case EntityType.NPC:
        const entityBlueprint = blueprintManager.getBlueprint("npcs", (entity as INPC).baseKey) as any;
        isMagicEntity = entityBlueprint?.isMagic;
        break;

      case EntityType.Character:
        isMagicEntity = [CharacterClass.Sorcerer, CharacterClass.Druid].includes(
          (entity as ICharacter).class as CharacterClass
        );
        break;

      default:
        isMagicEntity = false;
    }

    return isMagicEntity
      ? attackerStrengthLevel + 2 * attackerMagicLevel
      : attackerMagicLevel + 2 * attackerStrengthLevel;
  }

  private async getAttackerMagicStrengthLevel(attackerSkills: ISkill): Promise<{
    attackerMagicLevel: number;
    attackerStrengthLevel: number;
  }> {
    const attackerMagicLevel = await this.skillGetter.getSkillLevelWithBuffs(attackerSkills, BasicAttribute.Magic);
    const attackerStrengthLevel = await this.skillGetter.getSkillLevelWithBuffs(
      attackerSkills,
      BasicAttribute.Strength
    );

    return { attackerMagicLevel, attackerStrengthLevel };
  }

  private async getTargetResistances(
    targetSkill: ISkill
  ): Promise<{ resistanceLevel: number; magicResistanceLevel: number }> {
    const resistanceLevel = await this.skillGetter.getSkillLevelWithBuffs(targetSkill, BasicAttribute.Resistance);
    const magicResistanceLevel = await this.skillGetter.getSkillLevelWithBuffs(
      targetSkill,
      BasicAttribute.MagicResistance
    );

    return { resistanceLevel, magicResistanceLevel };
  }

  private isMage(character: ICharacter | INPC): boolean {
    return (
      character.type === EntityType.Character &&
      (character.class === CharacterClass.Druid || character.class === CharacterClass.Sorcerer)
    );
  }
}
