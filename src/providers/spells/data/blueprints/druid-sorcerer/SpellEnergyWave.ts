import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { HitTargetQueue } from "@providers/battle/HitTargetQueue";
import { SPELL_AREA_DIAMOND_BLAST_RADIUS } from "@providers/constants/SpellConstants";
import { entityEffectFreezing } from "@providers/entityEffects/data/blueprints/entityEffectFreezing";
import { characterBuffActivator, container } from "@providers/inversify/container";
import { UsableEffectsBlueprint } from "@providers/item/data/usableEffects/types";
import { SpellArea } from "@providers/spells/area-spells/SpellArea";
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

export const spellEnergyWave: Partial<ISpell> = {
  key: SpellsBlueprint.EnergyWave,
  name: "Energy Wave",
  description: "Unleashes a powerful wave of energy, damaging and stunning enemies caught in its path.",
  textureAtlas: "icons",
  texturePath: "spell-icons/energy-wave.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "mahta falma",
  manaCost: 80,
  minLevelRequired: 15,
  minMagicLevelRequired: 12,
  cooldown: 20,
  castingAnimationKey: AnimationEffectKeys.SkillLevelUp,
  targetHitAnimationKey: AnimationEffectKeys.QuickFire,
  projectileAnimationKey: AnimationEffectKeys.Blue,
  maxDistanceGrid: RangeTypes.High,
  characterClass: [CharacterClass.Druid, CharacterClass.Sorcerer],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const spellArea = container.get(SpellArea);

    await spellArea.cast(character, target, MagicPower.UltraHigh, {
      effectAnimationKey: AnimationEffectKeys.QuickFire,
      spellAreaGrid: SPELL_AREA_DIAMOND_BLAST_RADIUS,
      entityEffect: entityEffectFreezing,
      customFn: async (target: ICharacter | INPC, intensity: number) => {
        const spellCalculator = container.get(SpellCalculator);
        const hitTarget = container.get(HitTargetQueue);

        await hitTarget.hit(character, target, true, MagicPower.UltraHigh + intensity, true);

        if (target.type === "Character") {
          const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
            min: 30,
            max: 60,
          });

          const debuffPercentage = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
            min: 20,
            max: 35,
          });
          await characterBuffActivator.enableTemporaryBuff(target as ICharacter, {
            type: CharacterBuffType.CharacterAttribute,
            trait: CharacterAttributes.Speed,
            buffPercentage: -debuffPercentage,
            durationSeconds: timeout,
            durationType: CharacterBuffDurationType.Temporary,
            options: {
              messages: {
                activation: `You're affected by the energy wave, and your speed is reduced! (-${debuffPercentage}%)`,
                deactivation: "You're no longer affected by the energy wave!",
              },
            },
            isStackable: false,
            originateFrom: UsableEffectsBlueprint.ThunderRuneUsableEffect,
          });
        }
      },
    });

    return true;
  },
};
