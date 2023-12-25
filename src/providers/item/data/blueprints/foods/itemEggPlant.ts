import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemEggPlant: IConsumableItemBlueprint = {
  key: FoodsBlueprint.Eggplant,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/eggplant.png",
  name: "Eggplant",
  description: "A fruit that is known for its unique taste and texture, often used in cooking.",
  weight: 0.1,
  maxStackSize: 999,
  basePrice: 12,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.StrongEatingEffect,
};
