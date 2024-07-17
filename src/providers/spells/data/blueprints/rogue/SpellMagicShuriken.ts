import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { HitTargetQueue } from "@providers/battle/HitTargetQueue";
import { EntityEffectUse } from "@providers/entityEffects/EntityEffectUse";
import { entityEffectBleeding } from "@providers/entityEffects/data/blueprints/entityEffectBleeding";
import { container } from "@providers/inversify/container";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterClass,
  ISpell,
  RangeTypes,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";

export const spellMagicShuriken: Partial<ISpell> = {
  key: SpellsBlueprint.MagicShuriken,
  name: "Magic Shuriken",
  description:
    "Unleash a mystical shuriken imbued with arcane energy, striking enemies with both physical and magical damage",
  textureAtlas: "icons",
  texturePath: "spell-icons/magic-shuriken.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "ithil celebatharth",
  manaCost: 30,
  minLevelRequired: 5,
  minMagicLevelRequired: 5,
  cooldown: 5,
  castingAnimationKey: AnimationEffectKeys.SkillLevelUp,
  targetHitAnimationKey: AnimationEffectKeys.Hit,
  projectileAnimationKey: AnimationEffectKeys.Shuriken,
  maxDistanceGrid: RangeTypes.Medium,
  characterClass: [CharacterClass.Rogue],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const entityEffectUse = container.get(EntityEffectUse);
    const hitTarget = container.get(HitTargetQueue);

    const spellCalculator = container.get(SpellCalculator);

    const skillDamage = await spellCalculator.spellDamageCalculator(character, BasicAttribute.Dexterity, {
      level: true,
      minLevelMultiplier: 0.2,
      maxLevelMultiplier: 1.2,
    });

    await hitTarget.hit(character, target, true, skillDamage, true);

    await entityEffectUse.applyEntityEffects(target, character, entityEffectBleeding);

    return true;
  },
};
