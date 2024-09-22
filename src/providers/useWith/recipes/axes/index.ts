import { AxesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeAxe } from "./tier0/recipeAxe";
import { recipeWoodenAxe } from "./tier0/recipeWoodenAxe";
import { recipeCopperAxe } from "./tier1/recipeCopperAxe";
import { recipeSilentScreamAxe } from "./tier10/recipeSilentScreamAxe";
import { recipeGoldenReaverAxe } from "./tier11/recipeGoldenReaverAxe";
import { recipeMinecraftAxe } from "./tier11/recipeMinecraftAxe";
import { recipeShadowedReaver } from "./tier12/recipeShadowedReaver";
import { recipeThunderstrikeAxe } from "./tier12/recipeThunderstrikeAxe";
import { recipeWarAxe } from "./tier12/recipeWarAxe";
import { recipeInfernalCleaver } from "./tier13/  recipeInfernalCleaver";
import { recipeWyvernSlayer } from "./tier13/  recipeWyvernSlayer";
import { recipeDanishAxe } from "./tier13/recipeDanishAxe";
import { recipeFrostbiteCleaver } from "./tier13/recipeFrostbiteClever";
import { recipeObsidianWaraxe } from "./tier14/  recipeObsidianWaraxe";
import { recipeStormbreakerAxe } from "./tier14/  recipeStormbreakerAxe";
import { recipeDualImpactAxe } from "./tier14/recipeDualImpactAxe";
import { recipeMaulAxe } from "./tier14/recipeMaulAxe";
import { recipeSpikeToppedAxe } from "./tier14/recipeSpikeToppedAxe";
import { recipeBlazingExecutioner } from "./tier15/  recipeBlazingExecutioner";
import { recipeBloodmoonCleaver } from "./tier15/  recipeBloodmoonCleaver";
import { recipeBrutalChopperAxe } from "./tier15/recipeBrutalChopperAxe";
import { recipeCrownedAxe } from "./tier15/recipeCrownedAxe";
import { recipeTwinEdgeAxe } from "./tier15/recipeTwinEdgeAxe";
import { recipeNightfallSplitter } from "./tier16/  recipeNightfallSplitter";
import { recipeThunderousMaul } from "./tier16/  recipeThunderousMaul";
import { recipeIroncladCleaver } from "./tier16/recipeIroncladCleaver";
import { recipeRoyalChopperAxe } from "./tier16/recipeRoyalChopperAxe";
import { recipeTimberSplitterAxe } from "./tier16/recipeTimberSplitterAxe";
import { recipeSeraphicAxe } from "./tier17/  recipeSeraphicAxe";
import { recipeVoidCleaver } from "./tier17/  recipeVoidCleaver";
import { recipeBoneReaperAxe } from "./tier17/recipeBoneReaperAxe";
import { recipeButterflierAxe } from "./tier17/recipeButterflierAxe";
import { recipeSavageSmasher } from "./tier17/recipeSavageSmasher";
import { recipeArcaneSunderer } from "./tier18/  recipeArcaneSunderer";
import { recipeStormforgeReaver } from "./tier18/  recipeStormforgeReaver";
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
import { recipeEmberstrikeAxe } from "./tier14/recipeEmberstrikeAxe";
import { recipeShadowfangAxe } from "./tier14/recipeShadowfangAxe";
import { recipeCrystalEdgeAxe } from "./tier15/recipeCrystalEdgeAxe";
import { recipeNightshadeAxe } from "./tier15/recipeNightshadeAxe";
import { recipeBloodthirstAxe } from "./tier16/recipeBloodthirstAxe";
import { recipeIronstormAxe } from "./tier16/recipeIronstormAxe";
import { recipeBlightReaver } from "./tier17/recipeBlightReaver";
import { recipeDragonfireAxe } from "./tier17/recipeDragonfireAxe";
import { recipeAbyssalCleave } from "./tier18/recipeAbyssalCleave";
import { recipeFrostbiteAxe } from "./tier18/recipeFrostbiteAxe";
import { recipeYggdrasilWarAxe } from "./tier5/recipeYggdrasilWarAxe";
import { recipeYggdrasilVikingAxe } from "./tier4/recipeYggdrasilVikingAxe";
import { recipeHellishVikingAxe } from "./tier3/recipeHellishVikingAxe";
import { recipeHellishWarAxe } from "./tier3/recipeHellishWarAxe";
import { recipeYetiHalberd } from "./tier4/recipeYetiHalberd";

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
  [AxesBlueprint.ShadowedReaver]: [recipeShadowedReaver],
  [AxesBlueprint.ThunderstrikeAxe]: [recipeThunderstrikeAxe],
  [AxesBlueprint.InfernalCleaver]: [recipeInfernalCleaver],
  [AxesBlueprint.WyvernSlayer]: [recipeWyvernSlayer],
  [AxesBlueprint.FrostbiteCleaver]: [recipeFrostbiteCleaver],
  [AxesBlueprint.ObsidianWaraxe]: [recipeObsidianWaraxe],
  [AxesBlueprint.StormbreakerAxe]: [recipeStormbreakerAxe],
  [AxesBlueprint.BloodmoonCleaver]: [recipeBloodmoonCleaver],
  [AxesBlueprint.ThunderousMaul]: [recipeThunderousMaul],
  [AxesBlueprint.SeraphicAxe]: [recipeSeraphicAxe],
  [AxesBlueprint.VoidCleaver]: [recipeVoidCleaver],
  [AxesBlueprint.ArcaneSunderer]: [recipeArcaneSunderer],
  [AxesBlueprint.StormforgeReaver]: [recipeStormforgeReaver],
  [AxesBlueprint.BlazingExecutioner]: [recipeBlazingExecutioner],
  [AxesBlueprint.NightfallSplitter]: [recipeNightfallSplitter],
  [AxesBlueprint.ShadowfangAxe]: [recipeShadowfangAxe],
  [AxesBlueprint.EmberstrikeAxe]: [recipeEmberstrikeAxe],
  [AxesBlueprint.CrystalEdgeAxe]: [recipeCrystalEdgeAxe],
  [AxesBlueprint.NightshadeAxe]: [recipeNightshadeAxe],
  [AxesBlueprint.BloodthirstAxe]: [recipeBloodthirstAxe],
  [AxesBlueprint.IronstormAxe]: [recipeIronstormAxe],
  [AxesBlueprint.BlightReaver]: [recipeBlightReaver],
  [AxesBlueprint.DragonfireAxe]: [recipeDragonfireAxe],
  [AxesBlueprint.FrostbiteAxe]: [recipeFrostbiteAxe],
  [AxesBlueprint.AbyssalCleave]: [recipeAbyssalCleave],
  [AxesBlueprint.YggdrasilWarAxe]: [recipeYggdrasilWarAxe],
  [AxesBlueprint.YggdrasilVikingAxe]: [recipeYggdrasilVikingAxe],
  [AxesBlueprint.YetiHalberd]: [recipeYetiHalberd],
  [AxesBlueprint.HellishVikingAxe]: [recipeHellishVikingAxe],
  [AxesBlueprint.HellishWarAxe]: [recipeHellishWarAxe],
};
