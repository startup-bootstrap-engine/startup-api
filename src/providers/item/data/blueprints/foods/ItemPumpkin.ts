import { FARMING_HARVEST_PRICE_RATIO } from "@providers/constants/FarmingConstants";
import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemPumpkin: IConsumableItemBlueprint = {
  key: FoodsBlueprint.Pumpkin,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/pumpkin.png",
  name: "Pumpkin",
  description: "A large round vegetable with a thick orange rind, often used in cooking and decoration.",
  weight: 0.5,
  maxStackSize: 999,
  basePrice: 75 * FARMING_HARVEST_PRICE_RATIO,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.SuperStrongEatingEffect,
};
