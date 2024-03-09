import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { HitTargetQueue } from "@providers/battle/HitTargetQueue";
import { EntityEffectUse } from "@providers/entityEffects/EntityEffectUse";
import { entityEffectBurning } from "@providers/entityEffects/data/blueprints/entityEffectBurning";
import { container } from "@providers/inversify/container";
import {
  AnimationEffectKeys,
  CharacterClass,
  ISpell,
  MagicPower,
  RangeTypes,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";

export const spellFireBolt: Partial<ISpell> = {
  key: SpellsBlueprint.FireBolt,
  name: "Fire Bolt",
  description: "Cast a deadly fire bolt at your target.",
  textureAtlas: "icons",
  texturePath: "spell-icons/fire-bolt.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "naurlug lhegren",
  manaCost: 120,
  minLevelRequired: 8,
  minMagicLevelRequired: 12,
  cooldown: 5,
  castingAnimationKey: AnimationEffectKeys.SkillLevelUp,
  targetHitAnimationKey: AnimationEffectKeys.Burn,
  projectileAnimationKey: AnimationEffectKeys.FireBall,
  maxDistanceGrid: RangeTypes.Medium,
  characterClass: [CharacterClass.Druid, CharacterClass.Sorcerer],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const entityEffectUse = container.get(EntityEffectUse);
    const hitTarget = container.get(HitTargetQueue);

    await hitTarget.hit(character, target, true, MagicPower.Low, true);

    await entityEffectUse.applyEntityEffects(target, character, entityEffectBurning);

    return true;
  },
};
