import { ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeElderHeartAxe } from "./recipeElderHeartAxe";
import { recipeLogSplitterAxe } from "./recipeLogSplitterAxe";
import { recipeWoodBreakerAxe } from "./recipeWoodBreakerAxe";
import { recipeWoodsManAxe } from "./recipeWoodsManAxe";

export const recipeToolsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [ToolsBlueprint.ElderHeartAxe]: [recipeElderHeartAxe],
  [ToolsBlueprint.LogSplitterAxe]: [recipeLogSplitterAxe],
  [ToolsBlueprint.WoodBreakerAxe]: [recipeWoodBreakerAxe],
  [ToolsBlueprint.WoodsManAxe]: [recipeWoodsManAxe],
};
