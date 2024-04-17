import { CraftingResourcesBlueprint, MacesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeStarfirMaulClub: IUseWithCraftingRecipe = {
  outputKey: MacesBlueprint.StarfirMaulClub,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 2,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 30],
};
