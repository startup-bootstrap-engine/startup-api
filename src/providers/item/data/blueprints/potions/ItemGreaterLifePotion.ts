import { IConsumableItemBlueprint, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { PotionsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemGreaterLifePotion: IConsumableItemBlueprint = {
  key: PotionsBlueprint.GreaterLifePotion,
  type: ItemType.Consumable,
  subType: ItemSubType.Potion,
  textureAtlas: "items",
  texturePath: "potions/greater-life-potion.png",

  name: "Greater Life Potion",
  description: "A flask containing deep red liquid of a greater elixir of life.",
  weight: 0.5,
  basePrice: 200,
  maxStackSize: 999,
  canSell: false,

  usableEffectKey: UsableEffectsBlueprint.GreaterLifePotionUsableEffect,

  canBePurchasedOnlyByPremiumPlans: [UserAccountTypes.PremiumGold, UserAccountTypes.PremiumUltimate],
};
