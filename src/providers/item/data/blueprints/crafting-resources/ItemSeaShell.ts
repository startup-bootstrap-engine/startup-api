import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemSeaShell: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.SeaShell,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/sea-shell.png",
  name: "Sea Shell",
  description: "A beautiful sea shell.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 20,
};
