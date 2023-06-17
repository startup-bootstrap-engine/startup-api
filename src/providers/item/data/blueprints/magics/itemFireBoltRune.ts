import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { EffectableAttribute, ItemUsableEffect } from "@providers/item/helper/ItemUsableEffect";
import { calculateItemUseEffectPoints } from "@providers/useWith/libs/UseWithHelper";

import { EntityEffectUse } from "@providers/entityEffects/EntityEffectUse";
import { entityEffectBurning } from "@providers/entityEffects/data/blueprints/entityEffectBurning";
import { container } from "@providers/inversify/container";
import {
  AnimationEffectKeys,
  BasicAttribute,
  IRuneItemBlueprint,
  ItemSubType,
  ItemType,
  MagicPower,
  RangeTypes,
} from "@rpg-engine/shared";

import { SpellCalculator } from "@providers/spells/data/abstractions/SpellCalculator";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemFireBoltRune: IRuneItemBlueprint = {
  key: MagicsBlueprint.FireBoltRune,
  type: ItemType.Tool,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/fire-bolt-rune.png",
  name: "Fire Bolt Rune",
  description: "An ancient Fire Bolt Rune.",
  weight: 0.01,
  maxStackSize: 100,
  hasUseWith: true,

  canUseOnNonPVPZone: false,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  power: MagicPower.Medium,
  minMagicLevelRequired: 5,
  canSell: false,
  animationKey: AnimationEffectKeys.Hit,
  projectileAnimationKey: AnimationEffectKeys.Red,
  usableEffect: async (caster: ICharacter, target: ICharacter | INPC) => {
    const itemUsableEffect = container.get(ItemUsableEffect);
    const entityEffectUse = container.get(EntityEffectUse);

    const points = await calculateItemUseEffectPoints(MagicsBlueprint.FireBoltRune, caster);

    const spellCalculator = container.get(SpellCalculator);

    const pointModifier = await spellCalculator.calculateBuffBasedOnSkillLevel(caster, BasicAttribute.Magic, {
      min: 2,
      max: 4,
    });

    itemUsableEffect.apply(target, EffectableAttribute.Health, -pointModifier * points);

    await entityEffectUse.applyEntityEffects(target, caster, entityEffectBurning);

    return points;
  },
  usableEffectDescription:
    "Deals fire damage to the target. Damage depends on your magic level and it gives a burning effect.",
};
