import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemBloodrootBlossomFlower: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.BloodrootBlossomFlower,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/bloodroot-blossom.png",
  name: "Bloodroot Blossom Flower",
  description:
    "The crimson blooms yield essence-filled petals and sap, vital ingredients pulsing with life for alchemical concoctions.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 20,
};
