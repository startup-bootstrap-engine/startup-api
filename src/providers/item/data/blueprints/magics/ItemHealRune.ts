import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { EffectableAttribute, ItemUsableEffect } from "@providers/item/helper/ItemUsableEffect";
import { calculateItemUseEffectPoints } from "@providers/useWith/libs/UseWithHelper";

import { container } from "@providers/inversify/container";
import {
  AnimationEffectKeys,
  IRuneItemBlueprint,
  ItemSubType,
  ItemType,
  MagicPower,
  RangeTypes,
} from "@rpg-engine/shared";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemHealRune: IRuneItemBlueprint = {
  key: MagicsBlueprint.HealRune,
  type: ItemType.Tool,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/heal-rune.png",

  name: "Healing Rune",
  description: "An ancient healing rune.",
  weight: 0.01,
  maxStackSize: 100,

  hasUseWith: true,
  canUseOnNonPVPZone: true,
  useWithMaxDistanceGrid: RangeTypes.Short,
  power: MagicPower.Low,
  minMagicLevelRequired: 8,
  canSell: false,
  animationKey: AnimationEffectKeys.HitHeal,
  projectileAnimationKey: AnimationEffectKeys.Heal,

  usableEffect: async (caster: ICharacter, target: ICharacter | INPC) => {
    const itemUsableEffect = container.get(ItemUsableEffect);

    const points = await calculateItemUseEffectPoints(MagicsBlueprint.HealRune, caster);

    itemUsableEffect.apply(target, EffectableAttribute.Health, points);
  },
  usableEffectDescription: "Heals HP of target",
};
