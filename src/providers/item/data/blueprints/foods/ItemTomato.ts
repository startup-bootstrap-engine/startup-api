import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemTomato: IConsumableItemBlueprint = {
  key: FoodsBlueprint.Tomato,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/tomato.png",
  name: "Tomato",
  description: "Tomatoes are red shaped fruits that can be found in tropical areas.",
  weight: 0.5,
  maxStackSize: 999,
  basePrice: 88,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.ModerateEatingEffect,
};
