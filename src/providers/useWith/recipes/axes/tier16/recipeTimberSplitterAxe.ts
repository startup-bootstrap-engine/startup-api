import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeTimberSplitterAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.TimberSplitterAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 90,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 58],
};
