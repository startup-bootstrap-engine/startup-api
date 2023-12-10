import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { HitTarget } from "@providers/battle/HitTarget";
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

export const spellBlizzard: Partial<ISpell> = {
  key: SpellsBlueprint.Blizzard,
  name: "Blizzard",
  description:
    "Conjures a relentless tempest of ice and snow, enveloping the designated area in a freezing whirlwind of wintry fury.",
  textureAtlas: "icons",
  texturePath: "spell-icons/blizzard.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "losse ninqe lanta",
  manaCost: 70,
  minLevelRequired: 12,
  minMagicLevelRequired: 10,
  cooldown: 15,
  castingAnimationKey: AnimationEffectKeys.SkillLevelUp,
  targetHitAnimationKey: AnimationEffectKeys.Freeze,
  projectileAnimationKey: AnimationEffectKeys.Freeze,
  maxDistanceGrid: RangeTypes.High,
  characterClass: [CharacterClass.Druid, CharacterClass.Sorcerer],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const spellArea = container.get(SpellArea);

    await spellArea.cast(character, target, MagicPower.UltraHigh, {
      effectAnimationKey: AnimationEffectKeys.Freeze,
      spellAreaGrid: SPELL_AREA_DIAMOND_BLAST_RADIUS,
      entityEffect: entityEffectFreezing,
      customFn: async (target: ICharacter | INPC, intensity: number) => {
        const spellCalculator = container.get(SpellCalculator);
        const hitTarget = container.get(HitTarget);

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
                activation: `You're frozen, and your speed is reduced! (-${debuffPercentage}%)`,
                deactivation: "You're no longer frozen!",
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
