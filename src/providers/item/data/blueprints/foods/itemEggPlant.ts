import { FARMING_HARVEST_PRICE_RATIO } from "@providers/constants/FarmingConstants";
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
  basePrice: 65 * FARMING_HARVEST_PRICE_RATIO,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.StrongEatingEffect,
};
