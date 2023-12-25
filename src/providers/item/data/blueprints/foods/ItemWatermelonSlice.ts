import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemWatermelonSlice: IConsumableItemBlueprint = {
  key: FoodsBlueprint.WatermelonSlice,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/watermelon.png",
  name: "Watermelon Slice",
  description: "A fruit that can be found in temperate areas.",
  weight: 0.5,
  maxStackSize: 999,
  basePrice: 4,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.MinorEatingEffect,
};
