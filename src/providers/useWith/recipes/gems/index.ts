import { GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeEmeraldGem } from "./tier0/recipeEmeraldGem";
import { recipeSapphireGem } from "./tier0/recipeSapphireGem";
import { recipeTopazRadiance } from "./tier0/recipeTopazRadiance";
import { recipeCoralReefGem } from "./tier1/recipeCoralReefGem";
import { recipeMistyQuartzGem } from "./tier1/recipeMistyQuartzGem";
import { recipeRubyGem } from "./tier1/recipeRubyGem";
import { recipeEarthstoneGem } from "./tier2/recipeEarthstoneGem";
import { recipeJasperGem } from "./tier2/recipeJasperGem";
import { recipeObsidianGem } from "./tier2/recipeObsidianGem";
import { recipeAmethystGem } from "./tier3/recipeAmethystGem";

export const recipeGemsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [GemsBlueprint.AmethystGem]: [recipeAmethystGem],
  [GemsBlueprint.CoralReefGem]: [recipeCoralReefGem],
  [GemsBlueprint.EmeraldGem]: [recipeEmeraldGem],
  [GemsBlueprint.RubyGem]: [recipeRubyGem],
  [GemsBlueprint.SapphireGem]: [recipeSapphireGem],
  [GemsBlueprint.TopazRadiance]: [recipeTopazRadiance],
  [GemsBlueprint.MistyQuartzGem]: [recipeMistyQuartzGem],
  [GemsBlueprint.EarthstoneGem]: [recipeEarthstoneGem],
  [GemsBlueprint.JasperGem]: [recipeJasperGem],
  [GemsBlueprint.ObsidianGem]: [recipeObsidianGem],
};
