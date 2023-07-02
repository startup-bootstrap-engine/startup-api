import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemBread: IConsumableItemBlueprint = {
  key: FoodsBlueprint.Bread,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/bread.png",

  name: "Bread",
  description: "A loaf of bread.",
  weight: 0.1,
  maxStackSize: 50,
  basePrice: 9,
  canSell: false,
  usableEffectKey: UsableEffectsBlueprint.SuperStrongEatingEffect,
};
