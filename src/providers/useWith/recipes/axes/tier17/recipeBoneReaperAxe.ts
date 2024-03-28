import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeBoneReaperAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.BoneReaperAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Bones,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.IronOre,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Leather,
      qty: 80,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 65],
};
