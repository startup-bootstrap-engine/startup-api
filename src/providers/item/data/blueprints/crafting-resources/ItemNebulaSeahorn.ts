import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemNebulaSeahorn: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.NebulaSeahorn,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/nebula-seahorn.png",
  name: "Nebula Seahorn",
  description: "A mysterous seahorn from the nebula archipelago.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 450,
};
