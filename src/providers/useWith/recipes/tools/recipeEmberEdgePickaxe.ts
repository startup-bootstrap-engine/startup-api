import { CraftingResourcesBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeEmberEdgePickaxe: IUseWithCraftingRecipe = {
  outputKey: ToolsBlueprint.EmberEdgePickaxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.IronOre,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 30,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Mining, 20],
};
