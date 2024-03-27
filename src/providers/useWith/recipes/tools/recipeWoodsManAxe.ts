import { CraftingResourcesBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeWoodsManAxe: IUseWithCraftingRecipe = {
  outputKey: ToolsBlueprint.WoodsManAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreaterWoodenLog,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 50,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 25],
};
