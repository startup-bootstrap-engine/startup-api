import { DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeFrostbiteBlade } from "../swords/tier3/recipeFrostbiteBlade";
import { recipeWoodenDagger } from "./tier0/recipeWoodenDagger";
import { recipeStormswiftDagger } from "./tier10/recipeStormswiftDagger";
import { recipeAstralDagger } from "./tier11/recipeAstralDagger";
import { recipeStarshardDagger } from "./tier11/recipeStarshardDagger";
import { recipeAzurefireDagger } from "./tier12/recipeAzurefireDagger";
import { recipeEmberbladeDagger } from "./tier12/recipeEmberbladeDagger";
import { recipeShadowstrikeDagger } from "./tier12/recipeShadowstrikeDagger";
import { recipeCelestialShardDagger } from "./tier13/recipeCelestialShardDagger";
import { recipeSolarflareDagger } from "./tier13/recipeSolarflareDagger";
import { recipeWildfireDagger } from "./tier13/recipeWildfireDagger";
import { recipeBloodmoonDagger } from "./tier14/recipeBloodmoonDagger";
import { recipeMoonlightDagger } from "./tier14/recipeMoonlightDagger";
import { recipeThunderstrikeDagger } from "./tier15/recipeThunderstrikeDagger";
import { recipeVenomousFangDagger } from "./tier15/recipeVenomousFangDagger";
import { recipeEtherealVeilDagger } from "./tier16/recipeEtherealVeilDagger";
import { recipeSeraphicDagger } from "./tier17/recipeSeraphicDagger";
import { recipeTwilightThornDagger } from "./tier17/recipeTwilightThornDagger";
import { recipeObsidianEdgeDagger } from "./tier18/recipeObsidianEdgeDagger";
import { recipeFrostDagger } from "./tier2/recipeFrostDagger";
import { recipeAzureDagger } from "./tier4/recipeAzureDagger";
import { recipeGoldenDagger } from "./tier5/recipeGoldenDagger";
import { recipeHexBladeDagger } from "./tier8/recipeHexBladeDagger";
import { recipeMistfireDagger } from "./tier9/recipeMistfireDagger";
import { recipeSpiritBlade } from "./tier9/recipeSpiritBlade";

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
  [DaggersBlueprint.EmberbladeDagger]: [recipeEmberbladeDagger],
  [DaggersBlueprint.ShadowstrikeDagger]: [recipeShadowstrikeDagger],
  [DaggersBlueprint.CelestialShardDagger]: [recipeCelestialShardDagger],
  [DaggersBlueprint.MoonlightDagger]: [recipeMoonlightDagger],
  [DaggersBlueprint.VenomousFangDagger]: [recipeVenomousFangDagger],
  [DaggersBlueprint.SeraphicDagger]: [recipeSeraphicDagger],
  [DaggersBlueprint.ObsidianEdgeDagger]: [recipeObsidianEdgeDagger],
  [DaggersBlueprint.SolarflareDagger]: [recipeSolarflareDagger],
  [DaggersBlueprint.BloodmoonDagger]: [recipeBloodmoonDagger],
  [DaggersBlueprint.ThunderstrikeDagger]: [recipeThunderstrikeDagger],
  [DaggersBlueprint.EtherealVeilDagger]: [recipeEtherealVeilDagger],
  [DaggersBlueprint.TwilightThornDagger]: [recipeTwilightThornDagger],
  [DaggersBlueprint.AzurefireDagger]: [recipeAzurefireDagger],
  [DaggersBlueprint.WildfireDagger]: [recipeWildfireDagger],
};
