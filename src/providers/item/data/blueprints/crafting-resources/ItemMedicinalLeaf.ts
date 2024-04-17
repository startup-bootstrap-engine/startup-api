import { ICraftableItemBlueprint, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CraftingResourcesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemMedicinalLeft: ICraftableItemBlueprint = {
  key: CraftingResourcesBlueprint.MedicinalLeaf,
  type: ItemType.CraftingResource,
  subType: ItemSubType.CraftingResource,
  textureAtlas: "items",
  texturePath: "crafting-resources/medicinal-leaf.png",
  name: "Medicinal Leaf",
  description: "A crafting resource used for making healing potions and antidotes.",
  weight: 0.01,
  maxStackSize: 999,
  basePrice: 32,
};
