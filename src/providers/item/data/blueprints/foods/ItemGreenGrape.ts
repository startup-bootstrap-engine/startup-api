import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemGreenGrape: IConsumableItemBlueprint = {
  key: FoodsBlueprint.GreenGrape,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/green-grape.png",
  name: "Green Grape",
  description: "A fruit that can be found in temperate areas.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 10,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.ModerateEatingEffect,
};
