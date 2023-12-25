import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemStrawberry: IConsumableItemBlueprint = {
  key: FoodsBlueprint.Strawberry,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/strawberry.png",
  name: "Strawberry",
  description: "A fruit that can be found in cold areas.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 9,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.ModerateEatingEffect,
};
