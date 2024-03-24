import { AxesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeAxe } from "./tier0/recipeAxe";
import { recipeWoodenAxe } from "./tier0/recipeWoodenAxe";
import { recipeCopperAxe } from "./tier1/recipeCopperAxe";
import { recipeSilentScreamAxe } from "./tier10/recipeSilentScreamAxe";
import { recipeGoldenReaverAxe } from "./tier11/recipeGoldenReaverAxe";
import { recipeMinecraftAxe } from "./tier11/recipeMinecraftAxe";
import { recipeWarAxe } from "./tier12/recipeWarAxe";
import { recipeDanishAxe } from "./tier13/recipeDanishAxe";
import { recipeDualImpactAxe } from "./tier14/recipeDualImpactAxe";
import { recipeMaulAxe } from "./tier14/recipeMaulAxe";
import { recipeSpikeToppedAxe } from "./tier14/recipeSpikeToppedAxe";
import { recipeBrutalChopperAxe } from "./tier15/recipeBrutalChopperAxe";
import { recipeCrownedAxe } from "./tier15/recipeCrownedAxe";
import { recipeTwinEdgeAxe } from "./tier15/recipeTwinEdgeAxe";
import { recipeIroncladCleaver } from "./tier16/recipeIroncladCleaver";
import { recipeRoyalChopperAxe } from "./tier16/recipeRoyalChopperAxe";
import { recipeTimberSplitterAxe } from "./tier16/recipeTimberSplitterAxe";
import { recipeBoneReaperAxe } from "./tier17/recipeBoneReaperAxe";
import { recipeButterflierAxe } from "./tier17/recipeButterflierAxe";
import { recipeSavageSmasher } from "./tier17/recipeSavageSmasher";
import { recipeCrownSplitterAxe } from "./tier18/recipeCrownSplitterAxe";
import { recipeRuneAxe } from "./tier2/recipeRuneAxe";
import { recipeSilverAxe } from "./tier2/recipeSilverAxe";
import { recipeDoubleAxe } from "./tier3/recipeDoubleAxe";
import { recipeFrostDoubleAxe } from "./tier3/recipeFrostDoubleAxe";
import { recipeGlacialHatchet } from "./tier3/recipeGlacialHatchet";
import { recipeShadowAxe } from "./tier3/recipeShadowAxe";
import { recipeVikingBattleAxe } from "./tier3/recipeVikingBattleAxe";
import { recipeGlacialAxe } from "./tier4/recipeGlacialAxe";
import { recipeWhiteRavenAxe } from "./tier4/recipeWhiteRavenAxe";
import { recipePhoenixWingAxe } from "./tier6/recipePhoenixWingAxe";
import { recipeCelestialArcAxe } from "./tier7/recipeCelestialArcAxe";
import { recipeGrandSanguineBattleaxe } from "./tier8/recipeGrandSanguineBattleaxe";
import { recipeRustBreakerAxe } from "./tier8/recipeRustBreakerAxe";
import { recipeGloriousAxe } from "./tier9/recipeGloriousAxe";
import { recipeHydraSlayerAxe } from "./tier9/recipeHydraSlayerAxe";

export const recipeAxesIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [AxesBlueprint.Axe]: [recipeAxe],
  [AxesBlueprint.DoubleAxe]: [recipeDoubleAxe],
  [AxesBlueprint.FrostDoubleAxe]: [recipeFrostDoubleAxe],
  [AxesBlueprint.RuneAxe]: [recipeRuneAxe],
  [AxesBlueprint.ShadowAxe]: [recipeShadowAxe],
  [AxesBlueprint.CopperAxe]: [recipeCopperAxe],
  [AxesBlueprint.SilverAxe]: [recipeSilverAxe],
  [AxesBlueprint.VikingBattleAxe]: [recipeVikingBattleAxe],
  [AxesBlueprint.WhiteRavenAxe]: [recipeWhiteRavenAxe],
  [AxesBlueprint.GlacialAxe]: [recipeGlacialAxe],
  [AxesBlueprint.GlacialHatchet]: [recipeGlacialHatchet],
  [AxesBlueprint.WoodenAxe]: [recipeWoodenAxe],
  [AxesBlueprint.CelestialArcAxe]: [recipeCelestialArcAxe],
  [AxesBlueprint.GloriousAxe]: [recipeGloriousAxe],
  [AxesBlueprint.GoldenReaverAxe]: [recipeGoldenReaverAxe],
  [AxesBlueprint.GrandSanguineBattleaxe]: [recipeGrandSanguineBattleaxe],
  [AxesBlueprint.HydraSlayerAxe]: [recipeHydraSlayerAxe],
  [AxesBlueprint.PhoenixWingAxe]: [recipePhoenixWingAxe],
  [AxesBlueprint.RustBreakerAxe]: [recipeRustBreakerAxe],
  [AxesBlueprint.SilentScreamAxe]: [recipeSilentScreamAxe],
  [AxesBlueprint.CrownedAxe]: [recipeCrownedAxe],
  [AxesBlueprint.CrownSplitterAxe]: [recipeCrownSplitterAxe],
  [AxesBlueprint.DanishAxe]: [recipeDanishAxe],
  [AxesBlueprint.MaulAxe]: [recipeMaulAxe],
  [AxesBlueprint.MinecraftAxe]: [recipeMinecraftAxe],
  [AxesBlueprint.RoyalChopperAxe]: [recipeRoyalChopperAxe],
  [AxesBlueprint.WarAxe]: [recipeWarAxe],
  [AxesBlueprint.DualImpactAxe]: [recipeDualImpactAxe],
  [AxesBlueprint.SpikeToppedAxe]: [recipeSpikeToppedAxe],
  [AxesBlueprint.BrutalChopperAxe]: [recipeBrutalChopperAxe],
  [AxesBlueprint.TwinEdgeAxe]: [recipeTwinEdgeAxe],
  [AxesBlueprint.IroncladCleaver]: [recipeIroncladCleaver],
  [AxesBlueprint.TimberSplitterAxe]: [recipeTimberSplitterAxe],
  [AxesBlueprint.BoneReaperAxe]: [recipeBoneReaperAxe],
  [AxesBlueprint.ButterflierAxe]: [recipeButterflierAxe],
  [AxesBlueprint.SavageSmasher]: [recipeSavageSmasher],
};
