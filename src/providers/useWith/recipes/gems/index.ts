import { GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeAmethystGem } from "./recipeAmethystGem";
import { recipeCoralReefGem } from "./recipeCoralReefGem";
import { recipeEmeraldGem } from "./recipeEmeraldGem";
import { recipeRubyGem } from "./recipeRubyGem";
import { recipeSapphireGem } from "./recipeSapphireGem";

export const recipeGemsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [GemsBlueprint.AmethystGem]: [recipeAmethystGem],
  [GemsBlueprint.CoralReefGem]: [recipeCoralReefGem],
  [GemsBlueprint.EmeraldGem]: [recipeEmeraldGem],
  [GemsBlueprint.RubyGem]: [recipeRubyGem],
  [GemsBlueprint.SapphireGem]: [recipeSapphireGem],
};
