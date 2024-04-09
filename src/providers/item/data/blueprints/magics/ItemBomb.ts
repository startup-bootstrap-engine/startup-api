import {
  AnimationEffectKeys,
  IRuneItemBlueprint,
  ItemSubType,
  ItemType,
  MagicPower,
  RangeTypes,
  UserAccountTypes,
} from "@rpg-engine/shared";

import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemBomb: IRuneItemBlueprint = {
  key: MagicsBlueprint.Bomb,
  type: ItemType.Tool,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/bomb.png",
  name: "Bomb",
  description:
    "A powerful bomb typically used by rogues. It can be used to deal significant damage to enemies. Handle with care.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 300,
  hasUseWith: true,
  canUseOnNonPVPZone: false,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  power: MagicPower.Medium,
  minMagicLevelRequired: 6,
  canSell: false,
  animationKey: AnimationEffectKeys.Hit,
  projectileAnimationKey: AnimationEffectKeys.Red,
  usableEffectKey: UsableEffectsBlueprint.BombUsableEffect,
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
};
