import { DaggersBlueprint } from "../../types/itemsBlueprintTypes";
import { itemDagger } from "./tier0/ItemDagger";
import { itemWoodenDagger } from "./tier0/ItemWoodenDagger";
import { itemCopperJitte } from "./tier1/ItemCopperJitte";
import { itemIronDagger } from "./tier1/ItemIronDagger";
import { itemIronJitte } from "./tier1/ItemIronJitte";
import { itemRustedDagger } from "./tier1/ItemRustedDagger";
import { itemRustedJitte } from "./tier1/ItemRustedJitte";
import { itemDarkmoonDagger } from "./tier10/itemDarkmoonDagger";
import { itemStormswiftDagger } from "./tier10/itemStormswiftDagger";
import { itemThunderboltDagger } from "./tier10/itemThunderboltDagger";
import { itemArrowheadDagger } from "./tier11/itemArrowheadDagger";
import { itemAstralDagger } from "./tier11/itemAstralDagger";
import { itemStarshardDagger } from "./tier11/itemStarshardDagger";
import { itemAzurefireDagger } from "./tier12/itemAzurefireDagger";
import { itemEmberbladeDagger } from "./tier12/itemEmberbladeDagger";
import { itemShadowstrikeDagger } from "./tier12/itemShadowstrikeDagger";
import { itemCelestialShardDagger } from "./tier13/itemCelestialShardDagger";
import { itemSolarflareDagger } from "./tier13/itemSolarflareDagger";
import { itemWildfireDagger } from "./tier13/itemWildfireDagger";
import { itemBloodmoonDagger } from "./tier14/itemBloodmoonDagger";
import { itemMoonlightDagger } from "./tier14/itemMoonlightDagger";
import { itemThunderstrikeDagger } from "./tier15/itemThunderstrikeDagger";
import { itemVenomousFangDagger } from "./tier15/itemVenomousFangDagger";
import { itemFrostfangDagger } from "./tier18/itemFrostfangDagger";
import { itemDamascusJitte } from "./tier2/ItemDamascusJitte";
import { itemFrostDagger } from "./tier2/ItemFrostDagger";
import { itemSaiDagger } from "./tier2/ItemSaiDagger";
import { itemCorruptionDagger } from "./tier3/ItemCorruptionDagger";
import { itemKunai } from "./tier3/ItemKunai";
import { itemNinjaKunai } from "./tier3/ItemNinjaKunai";
import { itemSapphireDagger } from "./tier3/ItemSapphireDagger";
import { itemSapphireJitte } from "./tier3/ItemSapphireJitte";
import { itemAzureDagger } from "./tier4/ItemAzureDagger";
import { itemHellishDagger } from "./tier4/ItemHellishDagger";
import { itemPhoenixDagger } from "./tier4/ItemPhoenixDagger";
import { itemPhoenixJitte } from "./tier4/ItemPhoenixJitte";
import { itemRomanDagger } from "./tier4/ItemRomanDagger";
import { itemVerdantDagger } from "./tier4/ItemVerdantDagger";
import { itemVerdantJitte } from "./tier4/ItemVerdantJitte";
import { itemGoldenDagger } from "./tier5/ItemGoldenDagger";
import { itemDewDagger } from "./tier6/ItemDewDagger";
import { itemFrostBiteDagger } from "./tier7/ItemFrostBiteDagger";
import { itemHexBladeDagger } from "./tier8/ItemHexBladeDagger";
import { itemSpiritBlade } from "./tier9/ItemSpiritBlade";
import { itemFlameheartDagger } from "./tier9/itemFlameheartDagger";
import { itemMistfireDagger } from "./tier9/itemMistfireDagger";

import { itemEtherealVeilDagger } from "./tier16/itemEtherealVeilDagger";
import { itemSeraphicDagger } from "./tier17/itemSeraphicDagger";
import { itemTwilightThornDagger } from "./tier17/itemTwilightThornDagger";
import { itemObsidianEdgeDagger } from "./tier18/itemObsidianEdgeDagger";

export const daggersBlueprintIndex = {
  [DaggersBlueprint.Dagger]: itemDagger,
  [DaggersBlueprint.FrostDagger]: itemFrostDagger,
  [DaggersBlueprint.CorruptionDagger]: itemCorruptionDagger,
  [DaggersBlueprint.GoldenDagger]: itemGoldenDagger,
  [DaggersBlueprint.HellishDagger]: itemHellishDagger,
  [DaggersBlueprint.Kunai]: itemKunai,
  [DaggersBlueprint.SaiDagger]: itemSaiDagger,
  [DaggersBlueprint.WoodenDagger]: itemWoodenDagger,
  [DaggersBlueprint.RomanDagger]: itemRomanDagger,
  [DaggersBlueprint.NinjaKunai]: itemNinjaKunai,
  [DaggersBlueprint.CopperJitte]: itemCopperJitte,
  [DaggersBlueprint.RustedDagger]: itemRustedDagger,
  [DaggersBlueprint.IronDagger]: itemIronDagger,
  [DaggersBlueprint.SapphireDagger]: itemSapphireDagger,
  [DaggersBlueprint.SapphireJitte]: itemSapphireJitte,
  [DaggersBlueprint.RustedJitte]: itemRustedJitte,
  [DaggersBlueprint.IronJitte]: itemIronJitte,
  [DaggersBlueprint.VerdantDagger]: itemVerdantDagger,
  [DaggersBlueprint.VerdantJitte]: itemVerdantJitte,
  [DaggersBlueprint.AzureDagger]: itemAzureDagger,
  [DaggersBlueprint.DamascusJitte]: itemDamascusJitte,
  [DaggersBlueprint.PhoenixDagger]: itemPhoenixDagger,
  [DaggersBlueprint.PhoenixJitte]: itemPhoenixJitte,
  [DaggersBlueprint.DewDagger]: itemDewDagger,
  [DaggersBlueprint.FrostBiteDagger]: itemFrostBiteDagger,
  [DaggersBlueprint.SpiritBlade]: itemSpiritBlade,
  [DaggersBlueprint.HexBladeDagger]: itemHexBladeDagger,
  [DaggersBlueprint.FlameheartDagger]: itemFlameheartDagger,
  [DaggersBlueprint.MistfireDagger]: itemMistfireDagger,
  [DaggersBlueprint.DarkmoonDagger]: itemDarkmoonDagger,
  [DaggersBlueprint.ThunderboltDagger]: itemThunderboltDagger,
  [DaggersBlueprint.StormswiftDagger]: itemStormswiftDagger,
  [DaggersBlueprint.ArrowheadDagger]: itemArrowheadDagger,
  [DaggersBlueprint.AstralDagger]: itemAstralDagger,
  [DaggersBlueprint.StarshardDagger]: itemStarshardDagger,
  [DaggersBlueprint.FrostfangDagger]: itemFrostfangDagger,
  [DaggersBlueprint.EmberbladeDagger]: itemEmberbladeDagger,
  [DaggersBlueprint.ShadowstrikeDagger]: itemShadowstrikeDagger,
  [DaggersBlueprint.CelestialShardDagger]: itemCelestialShardDagger,
  [DaggersBlueprint.MoonlightDagger]: itemMoonlightDagger,
  [DaggersBlueprint.VenomousFangDagger]: itemVenomousFangDagger,
  [DaggersBlueprint.SeraphicDagger]: itemSeraphicDagger,
  [DaggersBlueprint.ObsidianEdgeDagger]: itemObsidianEdgeDagger,
  [DaggersBlueprint.SolarflareDagger]: itemSolarflareDagger,
  [DaggersBlueprint.BloodmoonDagger]: itemBloodmoonDagger,
  [DaggersBlueprint.ThunderstrikeDagger]: itemThunderstrikeDagger,
  [DaggersBlueprint.EtherealVeilDagger]: itemEtherealVeilDagger,
  [DaggersBlueprint.TwilightThornDagger]: itemTwilightThornDagger,
  [DaggersBlueprint.AzurefireDagger]: itemAzurefireDagger,
  [DaggersBlueprint.WildfireDagger]: itemWildfireDagger,
};
