import { FARMING_HARVEST_PRICE_RATIO } from "@providers/constants/FarmingConstants";
import { IConsumableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemCarrot: IConsumableItemBlueprint = {
  key: FoodsBlueprint.Carrot,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/carrot.png",
  name: "Carrot",
  description: "The carrot is a hardy, cool-season vegetable that thrives in fertile, well-drained soil.",
  weight: 0.5,
  maxStackSize: 999,
  basePrice: 29 * FARMING_HARVEST_PRICE_RATIO,
  canSell: true,
  usableEffectKey: UsableEffectsBlueprint.ModerateEatingEffect,
};
