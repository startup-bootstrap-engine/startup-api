import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { BERSERKER_BLOODTHIRST_HEALING_FACTOR } from "@providers/constants/BattleConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SigmoidCalculation } from "@providers/math/SigmoidCalculation";
import { TraitGetter } from "@providers/skill/TraitGetter";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { AnimationEffectKeys, BasicAttribute, CharacterClass, SpellsBlueprint } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { NamespaceRedisControl } from "../../types/SpellsBlueprintTypes";

@provide(Bloodthirst)
export class Bloodthirst {
  constructor(
    private socketMessaging: SocketMessaging,
    private inMemoryHashTable: InMemoryHashTable,
    private traitGetter: TraitGetter,
    private sigmoidCalculation: SigmoidCalculation,
    private animationEffect: AnimationEffect
  ) {}

  @TrackNewRelicTransaction()
  public async handleBerserkerAttack(character: ICharacter, damage: number): Promise<void> {
    try {
      if (!character || character.class !== CharacterClass.Berserker || character.health === character.maxHealth) {
        return;
      }

      await this.applyBerserkerBloodthirst(character, damage);
    } catch (error) {
      console.error(`Failed to handle berserker attack: ${error}`);
    }
  }

  @TrackNewRelicTransaction()
  public async getBerserkerBloodthirstSpell(character: ICharacter): Promise<boolean> {
    const namespace = `${NamespaceRedisControl.CharacterSpell}:${character._id.toString()}`;
    const key = SpellsBlueprint.BerserkerBloodthirst;
    const spell = await this.inMemoryHashTable.get(namespace, key);

    return !!spell;
  }

  private async applyBerserkerBloodthirst(character: ICharacter, damage: number): Promise<void> {
    try {
      const berserkerMultiplier = 0.5;

      const skills = (await Skill.findById(character.skills)
        .lean()
        .cacheQuery({
          cacheKey: `${character?._id}-skills`,
        })) as ISkill;

      const magicLevel = await this.traitGetter.getSkillLevelWithBuffs(skills, BasicAttribute.Magic);
      const characterLevel = skills?.level;
      const strengthLevel = await this.traitGetter.getSkillLevelWithBuffs(skills, BasicAttribute.Strength);

      const averageLevel = (magicLevel + characterLevel + strengthLevel) / 3;
      const healingFactor = this.sigmoidCalculation.sigmoid(averageLevel) * BERSERKER_BLOODTHIRST_HEALING_FACTOR;

      const calculatedHealing = Math.round(damage * berserkerMultiplier * healingFactor);

      const cappedHealing = Math.min(character.health + calculatedHealing, character.maxHealth);

      await Character.findByIdAndUpdate(character._id, { health: cappedHealing }).lean();

      await this.socketMessaging.sendEventAttributeChange(character._id);

      await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.Lifedrain);
    } catch (error) {
      console.error(`Failed to apply berserker bloodthirst: ${error} - ${character._id}`);
    }
  }
}
