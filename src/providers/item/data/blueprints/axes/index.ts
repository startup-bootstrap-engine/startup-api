import { AxesBlueprint } from "../../types/itemsBlueprintTypes";
import { itemAxe } from "./tier0/ItemAxe";
import { itemWoodenAxe } from "./tier0/ItemWoodenAxe";
import { itemCopperAxe } from "./tier1/ItemCopperAxe";
import { itemHatchet } from "./tier1/ItemHatchet";
import { itemBardiche } from "./tier1/itemBardiche";
import { itemSerpentDanceAxe } from "./tier10/ItemSerpentDanceAxe";
import { itemSilentScreamAxe } from "./tier10/ItemSilentScreamAxe";
import { itemGoldenReaverAxe } from "./tier11/ItemGoldenReaverAxe";
import { itemBattleAxe } from "./tier11/itemBattleAxe";
import { itemMinecraftAxe } from "./tier11/itemMinecraftAxe";
import { itemChaosAxe } from "./tier12/itemChaosAxe";
import { itemCleaverAxe } from "./tier12/itemCleaverAxe";
import { itemHammerCleaveAxe } from "./tier12/itemHammerCleaveAxe";
import { itemWarAxe } from "./tier12/itemWarAxe";
import { itemDanishAxe } from "./tier13/itemDanishAxe";
import { itemExecutionersAxe } from "./tier13/itemExecutionersAxe";
import { itemSpikedCleaverAxe } from "./tier13/itemSpikedCleaverAxe";
import { itemDualImpactAxe } from "./tier14/itemDualImpactAxe";
import { itemMaulAxe } from "./tier14/itemMaulAxe";
import { itemSpikeToppedAxe } from "./tier14/itemSpikeToppedAxe";
import { itemBrutalChopperAxe } from "./tier15/itemBrutalChopperAxe";
import { itemCrownedAxe } from "./tier15/itemCrownedAxe";
import { itemTwinEdgeAxe } from "./tier15/itemTwinEdgeAxe";
import { itemIroncladCleaver } from "./tier16/itemIroncladCleaver";
import { itemRoyalChopperAxe } from "./tier16/itemRoyalChopperAxe";
import { itemTimberSplitterAxe } from "./tier16/itemTimberSplitterAxe";
import { itemBoneReaperAxe } from "./tier17/itemBoneReaperAxe";
import { itemButterflierAxe } from "./tier17/itemButterflierAxe";
import { itemSavageSmasher } from "./tier17/itemSavageSmasher";
import { itemCrownSplitterAxe } from "./tier18/itemCrownSplitterAxe";
import { itemCorruptionAxe } from "./tier2/ItemCorruptionAxe";
import { itemRuneAxe } from "./tier2/ItemRuneAxe";
import { itemSilverAxe } from "./tier2/ItemSilverAxe";
import { itemVikingAxe } from "./tier2/ItemVikingAxe";
import { itemDwarvenWaraxe } from "./tier3/ItemDwarvenWaraxe";
import { itemFrostDoubleAxe } from "./tier3/ItemFrostDoubleAxe";
import { itemGlacialHatchet } from "./tier3/ItemGlacialHatchet";
import { itemHellishVikingAxe } from "./tier3/ItemHellishVikingAxe";
import { itemHellishWarAxe } from "./tier3/ItemHellishWarAxe";
import { itemNordicAxe } from "./tier3/ItemNordicAxe";
import { itemShadowAxe } from "./tier3/ItemShadowAxe";
import { itemVikingBattleAxe } from "./tier3/ItemVikingBattleAxe";
import { itemDoubleAxe } from "./tier3/itemDoubleAxe";
import { itemGlacialAxe } from "./tier4/ItemGlacialAxe";
import { itemGreatAxe } from "./tier4/ItemGreataxe";
import { itemHalberd } from "./tier4/ItemHalberd";
import { itemHellishAxe } from "./tier4/ItemHellishAxe";
import { itemWhiteRavenAxe } from "./tier4/ItemWhiteRavenAxe";
import { itemYetiHalberd } from "./tier4/ItemYetiHalberd";
import { itemYggdrasilVikingAxe } from "./tier4/ItemYggdrasilVikingAxe";
import { itemGoldenAxe } from "./tier5/ItemGoldenAxe";
import { itemRoyalDoubleAxe } from "./tier5/ItemRoyalDoubleAxe";
import { itemYggdrasilWarAxe } from "./tier5/ItemYggdrasilWarAxe";
import { itemDaramianWaraxe } from "./tier6/ItemDaramianWaraxe";
import { itemPhoenixWingAxe } from "./tier6/ItemPhoenixWingAxe";
import { itemCelestialArcAxe } from "./tier7/ItemCelestialArcAxe";
import { itemHandAxe } from "./tier7/ItemHandAxe";
import { itemMoonBeamAxe } from "./tier7/ItemMoonBeamAxe";
import { itemGrandSanguineBattleaxe } from "./tier8/ItemGrandSanguineBattleaxe";
import { itemRustBreakerAxe } from "./tier8/ItemRustBreakerAxe";
import { itemGloriousAxe } from "./tier9/ItemGloriousAxe";
import { itemGuardianAxe } from "./tier9/ItemGuardianAxe";
import { itemHydraSlayerAxe } from "./tier9/ItemHydraSlayerAxe";
import { itemInfernalCleaver } from "./tier13/itemInfernalCleaver";
import { itemShadowedReaver } from "./tier12/itemShadowedReaver";
import { itemThunderstrikeAxe } from "./tier12/itemThunderstrikeAxe";
import { itemFrostbiteCleaver } from "./tier13/itemFrostbiteCleaver";
import { itemWyvernSlayer } from "./tier13/itemWyvernSlayer";
import { itemObsidianWaraxe } from "./tier14/itemObsidianWaraxe";
import { itemStormbreakerAxe } from "./tier14/itemStormbreakerAxe";
import { itemBlazingExecutioner } from "./tier15/itemBlazingExecutioner";
import { itemBloodmoonCleaver } from "./tier15/itemBloodmoonCleaver";
import { itemNightfallSplitter } from "./tier16/itemNightfallSplitter";
import { itemThunderousMaul } from "./tier16/itemThunderousMaul";
import { itemSeraphicAxe } from "./tier17/itemSeraphicAxe";
import { itemVoidCleaver } from "./tier17/itemVoidCleaver";
import { itemArcaneSunderer } from "./tier18/itemArcaneSunderer";
import { itemStormforgeReaver } from "./tier18/itemStormforgeReaver";

export const axesBlueprintIndex = {
  [AxesBlueprint.Axe]: itemAxe,
  [AxesBlueprint.Bardiche]: itemBardiche,
  [AxesBlueprint.DoubleAxe]: itemDoubleAxe,
  [AxesBlueprint.FrostDoubleAxe]: itemFrostDoubleAxe,
  [AxesBlueprint.YetiHalberd]: itemYetiHalberd,
  [AxesBlueprint.CorruptionAxe]: itemCorruptionAxe,
  [AxesBlueprint.DwarvenWaraxe]: itemDwarvenWaraxe,
  [AxesBlueprint.GoldenAxe]: itemGoldenAxe,
  [AxesBlueprint.GreatAxe]: itemGreatAxe,
  [AxesBlueprint.Halberd]: itemHalberd,
  [AxesBlueprint.Hatchet]: itemHatchet,
  [AxesBlueprint.HellishAxe]: itemHellishAxe,
  [AxesBlueprint.RoyalDoubleAxe]: itemRoyalDoubleAxe,
  [AxesBlueprint.VikingAxe]: itemVikingAxe,
  [AxesBlueprint.WoodenAxe]: itemWoodenAxe,
  [AxesBlueprint.HellishVikingAxe]: itemHellishVikingAxe,
  [AxesBlueprint.HellishWarAxe]: itemHellishWarAxe,
  [AxesBlueprint.YggdrasilWarAxe]: itemYggdrasilWarAxe,
  [AxesBlueprint.YggdrasilVikingAxe]: itemYggdrasilVikingAxe,
  [AxesBlueprint.NordicAxe]: itemNordicAxe,
  [AxesBlueprint.RuneAxe]: itemRuneAxe,
  [AxesBlueprint.ShadowAxe]: itemShadowAxe,
  [AxesBlueprint.VikingBattleAxe]: itemVikingBattleAxe,
  [AxesBlueprint.CopperAxe]: itemCopperAxe,
  [AxesBlueprint.SilverAxe]: itemSilverAxe,
  [AxesBlueprint.WhiteRavenAxe]: itemWhiteRavenAxe,
  [AxesBlueprint.GlacialAxe]: itemGlacialAxe,
  [AxesBlueprint.GlacialHatchet]: itemGlacialHatchet,
  [AxesBlueprint.GuardianAxe]: itemGuardianAxe,
  [AxesBlueprint.GrandSanguineBattleaxe]: itemGrandSanguineBattleaxe,
  [AxesBlueprint.GloriousAxe]: itemGloriousAxe,
  [AxesBlueprint.HydraSlayerAxe]: itemHydraSlayerAxe,
  [AxesBlueprint.SerpentDanceAxe]: itemSerpentDanceAxe,
  [AxesBlueprint.SilentScreamAxe]: itemSilentScreamAxe,
  [AxesBlueprint.RustBreakerAxe]: itemRustBreakerAxe,
  [AxesBlueprint.MoonBeamAxe]: itemMoonBeamAxe,
  [AxesBlueprint.HandAxe]: itemHandAxe,
  [AxesBlueprint.PhoenixWingAxe]: itemPhoenixWingAxe,
  [AxesBlueprint.GoldenReaverAxe]: itemGoldenReaverAxe,
  [AxesBlueprint.DaramianWaraxe]: itemDaramianWaraxe,
  [AxesBlueprint.CelestialArcAxe]: itemCelestialArcAxe,
  [AxesBlueprint.BattleAxe]: itemBattleAxe,
  [AxesBlueprint.MinecraftAxe]: itemMinecraftAxe,
  [AxesBlueprint.ChaosAxe]: itemChaosAxe,
  [AxesBlueprint.CleaverAxe]: itemCleaverAxe,
  [AxesBlueprint.HammerCleaveAxe]: itemHammerCleaveAxe,
  [AxesBlueprint.WarAxe]: itemWarAxe,
  [AxesBlueprint.DanishAxe]: itemDanishAxe,
  [AxesBlueprint.ExecutionersAxe]: itemExecutionersAxe,
  [AxesBlueprint.SpikedCleaverAxe]: itemSpikedCleaverAxe,
  [AxesBlueprint.DualImpactAxe]: itemDualImpactAxe,
  [AxesBlueprint.MaulAxe]: itemMaulAxe,
  [AxesBlueprint.SpikeToppedAxe]: itemSpikeToppedAxe,
  [AxesBlueprint.BrutalChopperAxe]: itemBrutalChopperAxe,
  [AxesBlueprint.CrownedAxe]: itemCrownedAxe,
  [AxesBlueprint.TwinEdgeAxe]: itemTwinEdgeAxe,
  [AxesBlueprint.IroncladCleaver]: itemIroncladCleaver,
  [AxesBlueprint.RoyalChopperAxe]: itemRoyalChopperAxe,
  [AxesBlueprint.TimberSplitterAxe]: itemTimberSplitterAxe,
  [AxesBlueprint.BoneReaperAxe]: itemBoneReaperAxe,
  [AxesBlueprint.ButterflierAxe]: itemButterflierAxe,
  [AxesBlueprint.SavageSmasher]: itemSavageSmasher,
  [AxesBlueprint.CrownSplitterAxe]: itemCrownSplitterAxe,
  [AxesBlueprint.FrostbiteCleaver]: itemFrostbiteCleaver,
  [AxesBlueprint.ShadowedReaver]: itemShadowedReaver,
  [AxesBlueprint.ThunderstrikeAxe]: itemThunderstrikeAxe,
  [AxesBlueprint.ArcaneSunderer]: itemArcaneSunderer,
  [AxesBlueprint.InfernalCleaver]: itemInfernalCleaver,
  [AxesBlueprint.WyvernSlayer]: itemWyvernSlayer,
  [AxesBlueprint.ObsidianWaraxe]: itemObsidianWaraxe,
  [AxesBlueprint.StormbreakerAxe]: itemStormbreakerAxe,
  [AxesBlueprint.BloodmoonCleaver]: itemBloodmoonCleaver,
  [AxesBlueprint.BlazingExecutioner]: itemBlazingExecutioner,
  [AxesBlueprint.NightfallSplitter]: itemNightfallSplitter,
  [AxesBlueprint.ThunderousMaul]: itemThunderousMaul,
  [AxesBlueprint.VoidCleaver]: itemVoidCleaver,
  [AxesBlueprint.SeraphicAxe]: itemSeraphicAxe,
  [AxesBlueprint.StormforgeReaver]: itemStormforgeReaver,
};
