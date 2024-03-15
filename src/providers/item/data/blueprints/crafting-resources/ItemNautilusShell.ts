import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemNautilusShell: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.NautilusShell,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/nautilus-shell.png",
  name: "Nautilus Shell",
  description: "A nautilus shell.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 750,
};
