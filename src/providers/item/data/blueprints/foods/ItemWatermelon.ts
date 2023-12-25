import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemWatermelon: IConsumableItemBlueprint = {
  key: FoodsBlueprint.Watermelon,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/watermelon-2.png",
  name: "Watermelon",
  description: "A fruit that can be found in temperate areas.",
  weight: 0.5,
  maxStackSize: 999,
  basePrice: 4,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.StrongEatingEffect,
};
