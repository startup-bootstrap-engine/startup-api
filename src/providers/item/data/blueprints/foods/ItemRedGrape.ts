import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemRedGrape: IConsumableItemBlueprint = {
  key: FoodsBlueprint.RedGrape,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/red-grape.png",
  name: "Red Grape",
  description: "A fruit that can be found in temperate areas.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 148,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.ModerateEatingEffect,
};
