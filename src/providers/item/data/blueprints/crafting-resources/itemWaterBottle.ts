import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";
import { UsableEffectsBlueprint } from "../../usableEffects/types";

export const itemWaterBottle: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.WaterBottle,
  type: ItemType.Consumable,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/water-bottle.png",
  name: "Water",
  description: "A bottle of water. It can be used for crafting or to heal burning effects.",
  weight: 0.05,
  maxStackSize: 999,
  basePrice: 3,
  usableEffectKey: UsableEffectsBlueprint.ClearBurningUsableEffect,
};
