import { CraftingResourcesBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeLogSplitterAxe: IUseWithCraftingRecipe = {
  outputKey: ToolsBlueprint.LogSplitterAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverOre,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 15],
};
