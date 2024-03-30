import { ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeAurumAlloyPickaxe } from "./recipeAurumAlloyPickaxe";
import { recipeElderHeartAxe } from "./recipeElderHeartAxe";
import { recipeEmberEdgePickaxe } from "./recipeEmberEdgePickaxe";
import { recipeEmeraldEclipsesPickaxe } from "./recipeEmeraldEclipsesPickaxe";
import { recipeGildedLavaPickaxe } from "./recipeGildedLavaPickaxe";
import { recipeLogSplitterAxe } from "./recipeLogSplitterAxe";
import { recipeWoodBreakerAxe } from "./recipeWoodBreakerAxe";
import { recipeWoodsManAxe } from "./recipeWoodsManAxe";

export const recipeToolsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [ToolsBlueprint.ElderHeartAxe]: [recipeElderHeartAxe],
  [ToolsBlueprint.LogSplitterAxe]: [recipeLogSplitterAxe],
  [ToolsBlueprint.WoodBreakerAxe]: [recipeWoodBreakerAxe],
  [ToolsBlueprint.WoodsManAxe]: [recipeWoodsManAxe],
  [ToolsBlueprint.AurumAlloyPickaxe]: [recipeAurumAlloyPickaxe],
  [ToolsBlueprint.EmberEdgePickaxe]: [recipeEmberEdgePickaxe],
  [ToolsBlueprint.EmeraldEclipsesPickaxe]: [recipeEmeraldEclipsesPickaxe],
  [ToolsBlueprint.GildedLavaPickaxe]: [recipeGildedLavaPickaxe],
};
