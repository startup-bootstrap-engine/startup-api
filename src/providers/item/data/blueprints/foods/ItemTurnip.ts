import { FARMING_HARVEST_PRICE_RATIO } from "@providers/constants/FarmingConstants";
import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemTurnip: IConsumableItemBlueprint = {
  key: FoodsBlueprint.Turnip,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/turnip.png",

  name: "Turnip",
  description:
    "The turnip or white turnip is a root vegetable commonly grown in temperate climates worldwide for its white, fleshy taproot.",
  weight: 1,
  maxStackSize: 999,
  basePrice: 25 * FARMING_HARVEST_PRICE_RATIO,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.ModerateEatingEffect,
};
