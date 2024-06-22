import { GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";

import { recipeEmeraldGem } from "./tier0/recipeEmeraldGem";
import { recipeSapphireGem } from "./tier1/recipeSapphireGem";
import { recipeAmethystGem } from "./tier2/recipeAmethystGem";
import { recipeCoralReefGem } from "./tier3/recipeCoralReefGem";
import { recipeEarthstoneGem } from "./tier4/recipeEarthstoneGem";
import { recipeJasperGem } from "./tier5/recipeJasperGem";
import { recipeMistyQuartzGem } from "./tier6/recipeMistyQuartzGem";
import { recipeObsidianGem } from "./tier7/recipeObsidianGem";
import { recipeRubyGem } from "./tier8/recipeRubyGem";
import { recipeTopazRadiance } from "./tier9/recipeTopazRadiance";
import { recipeEmeraldGlory } from "./tier10/recipeEmeraldGlory";

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
  [GemsBlueprint.EmeraldGlory]: [recipeEmeraldGlory],
};
