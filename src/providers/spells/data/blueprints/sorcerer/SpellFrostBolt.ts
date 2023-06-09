import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { HitTarget } from "@providers/battle/HitTarget";
import { EntityEffectUse } from "@providers/entityEffects/EntityEffectUse";
import { entityEffectFreezing } from "@providers/entityEffects/data/blueprints/entityEffectFreezing";
import { characterBuffActivator, container } from "@providers/inversify/container";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  CharacterClass,
  ISpell,
  MagicPower,
  RangeTypes,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";

export const spellFrostBolt: Partial<ISpell> = {
  key: SpellsBlueprint.FrostBolt,
  name: "Frost Bolt",
  description: "Cast a deadly frost bolt at your target.",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "ning lhegren",
  manaCost: 100,
  minLevelRequired: 10,
  minMagicLevelRequired: 10,
  cooldown: 30,
  castingAnimationKey: AnimationEffectKeys.SkillLevelUp,
  targetHitAnimationKey: AnimationEffectKeys.Freeze,
  projectileAnimationKey: AnimationEffectKeys.HitBlue,
  maxDistanceGrid: RangeTypes.Medium,
  characterClass: [CharacterClass.Sorcerer],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const entityEffectUse = container.get(EntityEffectUse);
    const hitTarget = container.get(HitTarget);
    const spellCalculator = container.get(SpellCalculator);

    await hitTarget.hit(character, target, true, MagicPower.Medium);

    await entityEffectUse.applyEntityEffects(target, character, entityEffectFreezing);

    const timeout = await spellCalculator.calculateTimeoutBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 30,
      max: 60,
    });

    const debuffPercentage = await spellCalculator.calculateBuffBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 10,
      max: 25,
    });

    if (target.type === "Character") {
      await characterBuffActivator.enableTemporaryBuff(target as ICharacter, {
        type: CharacterBuffType.CharacterAttribute,
        trait: CharacterAttributes.Speed,
        buffPercentage: -debuffPercentage,
        durationSeconds: timeout,
        durationType: CharacterBuffDurationType.Temporary,
        options: {
          messages: {
            activation: `You're frozen, and your speed is reduced! (-${debuffPercentage}%)`,
            deactivation: "You're no longer frozen!",
          },
        },
      });
    }

    return true;
  },
};