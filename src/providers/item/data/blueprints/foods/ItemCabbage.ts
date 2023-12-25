import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemCabbage: IConsumableItemBlueprint = {
  key: FoodsBlueprint.Cabbage,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/cabbage.png",
  name: "Cabbage",
  description: "A leafy green or purple biennial plant, grown as an annual vegetable crop for its dense-leaved heads.",
  weight: 0.2,
  maxStackSize: 999,
  basePrice: 15,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.StrongEatingEffect,
};
