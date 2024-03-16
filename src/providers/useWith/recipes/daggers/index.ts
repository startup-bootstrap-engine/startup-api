import { DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeFrostbiteBlade } from "../swords/tier3/recipeFrostbiteBlade";
import { recipeAstralDagger } from "./recipeAstralDagger";
import { recipeAzureDagger } from "./recipeAzureDagger";
import { recipeFrostDagger } from "./recipeFrostDagger";
import { recipeGoldenDagger } from "./recipeGoldenDagger";
import { recipeHexBladeDagger } from "./recipeHexBladeDagger";
import { recipeMistfireDagger } from "./recipeMistfireDagger";
import { recipeSpiritBlade } from "./recipeSpiritBlade";
import { recipeStarshardDagger } from "./recipeStarshardDagger";
import { recipeStormswiftDagger } from "./recipeStormswiftDagger";
import { recipeWoodenDagger } from "./recipeWoodenDagger";

export const recipeDaggersIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [DaggersBlueprint.FrostDagger]: [recipeFrostDagger],
  [DaggersBlueprint.WoodenDagger]: [recipeWoodenDagger],
  [DaggersBlueprint.HexBladeDagger]: [recipeHexBladeDagger],
  [DaggersBlueprint.SpiritBlade]: [recipeSpiritBlade],
  [DaggersBlueprint.AzureDagger]: [recipeAzureDagger],
  [DaggersBlueprint.GoldenDagger]: [recipeGoldenDagger],
  [DaggersBlueprint.AstralDagger]: [recipeAstralDagger],
  [DaggersBlueprint.MistfireDagger]: [recipeMistfireDagger],
  [DaggersBlueprint.StarshardDagger]: [recipeStarshardDagger],
  [DaggersBlueprint.StormswiftDagger]: [recipeStormswiftDagger],
  [DaggersBlueprint.FrostBiteDagger]: [recipeFrostbiteBlade],
};
