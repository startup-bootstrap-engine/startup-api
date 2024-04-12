import { CraftingResourcesBlueprint, MacesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeMetalMasherClub: IUseWithCraftingRecipe = {
  outputKey: MacesBlueprint.MetalMasherClub,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 55,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 55,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 30,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 32],
};
