import { SwordsBlueprint } from "../../types/itemsBlueprintTypes";
import { itemSword } from "./tier0/ItemSword";
import { itemWoodenSword } from "./tier0/ItemWoodenSword";
import { itemBroadSword } from "./tier1/ItemBroadSword";
import { itemElvenSword } from "./tier1/ItemElvenSword";
import { itemIronwoodTanto } from "./tier1/ItemIronwoodTanto";
import { itemKatana } from "./tier1/ItemKatana";
import { itemShortSword } from "./tier1/ItemShortSword";
import { itemDiamondSword } from "./tier10/ItemDiamondSword";
import { itemElucidatorSword } from "./tier10/ItemElucidatorSword";
import { itemGuardianSword } from "./tier10/ItemGuardianSword";
import { itemRoyalGuardianSword } from "./tier10/ItemRoyalGuardianSword";
import { itemRoyalSword } from "./tier10/ItemRoyalSword";
import { itemTitaniumBroadsword } from "./tier10/ItemTitaniumBroadsword";
import { itemVioletVenomSword } from "./tier10/ItemVioletVenomSword";
import { itemYggdrasilGladius } from "./tier10/ItemYggdrasilGladius";
import { itemAngelicSword } from "./tier11/ItemAngelicSword";
import { itemEonGuardianSword } from "./tier11/ItemEonGuardianSword";
import { itemHellfireEdgeSword } from "./tier11/ItemHellfireEdgeSword";
import { itemInfernoEdgeSword } from "./tier11/ItemInfernoEdgeSword";
import { itemMinotaurSword } from "./tier11/ItemMinotaurSword";
import { itemNemesisSword } from "./tier11/ItemNemesisSword";
import { itemZephyrBlade } from "./tier11/itemZephyrBlade";
import { itemEmeraldBroadsword } from "./tier12/ItemEmeraldBroadsword";
import { itemGhostTalonSword } from "./tier12/ItemGhostTalonSword";
import { itemPhoenixSword } from "./tier12/ItemPhoenixSword";
import { itemWarlordBroadsword } from "./tier12/ItemWarlordBroadsword";
import { itemZenBroadsword } from "./tier12/ItemZenBroadsword";
import { itemCelestialReaver } from "./tier12/itemCelestialReaver";
import { itemPhoenixFury } from "./tier12/itemPhoenixFury";
import { itemYggdrasilJianSword } from "./tier13/ItemYggdrasilJianSword";
import { itemLunarEclipseBlade } from "./tier13/itemLunarEclipseBlade";
import { itemVoidslayer } from "./tier13/itemVoidslayer";
import { itemFrostbiteFang } from "./tier14/itemFrostbiteFang";
import { itemObsidianEdge } from "./tier14/itemObsidianEdge";
import { itemShadowstrikeFalchion } from "./tier14/itemShadowstrikeFalchion";
import { itemStormcallerScimitar } from "./tier14/itemStormcallerScimitar";
import { itemVenomousBlade } from "./tier14/itemVenomousBlade";
import { itemVenomousStinger } from "./tier14/itemVenomousStinger";
import { itemYggdrasilTemplarSword } from "./tier15/ItemYggdrasilTemplarSword";
import { itemAstralSaber } from "./tier15/itemAstralSaber";
import { itemFlamestrikeBlade } from "./tier15/itemFlamestrikeBlade";
import { itemMoonshadowBlade } from "./tier15/itemMoonshadowBlade";
import { itemShadowblade } from "./tier15/itemShadowblade";
import { itemSolarFlareSword } from "./tier15/itemSolarFlareSword";
import { itemThunderboltCutlass } from "./tier15/itemThunderboltCutlass";
import { itemVenomousFang } from "./tier15/itemVenomousFang";
import { itemAuroraBorealisBlade } from "./tier16/itemAuroraBorealisBlade";
import { itemBloodmoonBlade } from "./tier16/itemBloodmoonBlade";
import { itemEmberbrandClaymore } from "./tier16/itemEmberbrandClaymore";
import { itemEmberglowRapier } from "./tier16/itemEmberglowRapier";
import { itemFrostheartBroadsword } from "./tier16/itemFrostheartBroadsword";
import { itemSeraphicSabre } from "./tier16/itemSeraphicSabre";
import { itemSeraphicScimitar } from "./tier16/itemSeraphicScimitar";
import { itemShadowShredder } from "./tier16/itemShadowShredder";
import { itemThunderousClaymore } from "./tier16/itemThunderousClaymore";
import { itemBloodthornBroadsword } from "./tier17/itemBloodthornBroadsword";
import { itemCelestialEdge } from "./tier17/itemCelestialEdge";
import { itemCelestialSaber } from "./tier17/itemCelestialSaber";
import { itemFrostfireLongblade } from "./tier17/itemFrostfireLongblade";
import { itemMoonlightCrescent } from "./tier17/itemMoonlightCrescent";
import { itemStormbreaker } from "./tier17/itemStormbreaker";
import { itemThunderclapKatana } from "./tier17/itemThunderclapKatana";
import { itemThunderclapScimitar } from "./tier17/itemThunderclapScimitar";
import { itemThunderstormEdge } from "./tier17/itemThunderstormEdge";
import { itemCelestialDefender } from "./tier18/itemCelestialDefender";
import { itemDuskblade } from "./tier18/itemDuskblade";
import { itemFrostbiteSaber } from "./tier18/itemFrostbiteSaber";
import { itemFrostfireGladius } from "./tier18/itemFrostfireGladius";
import { itemFrostwindCutter } from "./tier18/itemFrostwindCutter";
import { itemInfernalSlicer } from "./tier18/itemInfernalSlicer";
import { itemInfernoCleaver } from "./tier18/itemInfernoCleaver";
import { itemSoulrenderSword } from "./tier18/itemSoulrenderSword";
import { itemCopperBroadsword } from "./tier2/ItemCopperBroadsword";
import { itemDoubleEdgedSword } from "./tier2/ItemDoubleEdgedSword";
import { itemIceSword } from "./tier2/ItemIceSword";
import { itemLongSword } from "./tier2/ItemLongSword";
import { itemRapier } from "./tier2/ItemRapier";
import { itemSaber } from "./tier2/ItemSaber";
import { itemAzureMachete } from "./tier3/ItemAzureMachete";
import { itemBasiliskSword } from "./tier3/ItemBasiliskSword";
import { itemCorruptionSword } from "./tier3/ItemCorruptionSword";
import { itemDamascusSword } from "./tier3/ItemDamascusSword";
import { itemFrostbiteBlade } from "./tier3/ItemFrostbiteBlade";
import { itemFrostguardSword } from "./tier3/ItemFrostguardSword";
import { itemKnightsSword } from "./tier3/ItemKnightsSword";
import { itemLightingSword } from "./tier3/ItemLightingSword";
import { itemShadowSword } from "./tier3/ItemShadowSword";
import { itemEldensSword } from "./tier4/ItemEldensSword";
import { itemEnchantedSword } from "./tier4/ItemEnchantedSword";
import { itemFalconsSword } from "./tier4/ItemFalconsSword";
import { itemFireSword } from "./tier4/ItemFireSword";
import { itemGlacialSword } from "./tier4/ItemGlacialSword";
import { itemIceShardLongsword } from "./tier4/ItemIceShardLongsword";
import { itemMithrilSword } from "./tier4/ItemMithrilSword";
import { itemPoisonSword } from "./tier4/ItemPoisonSword";
import { itemTungstenSword } from "./tier4/ItemTungstenSword";
import { itemCopperveinBlade } from "./tier5/ItemCopperveinBlade";
import { itemDragonsSword } from "./tier5/ItemDragonsSword";
import { itemGoldenSword } from "./tier5/ItemGoldenSword";
import { itemJianSword } from "./tier5/ItemJianSword";
import { itemLeviathanSword } from "./tier5/ItemLeviathanSword";
import { itemTemplarSword } from "./tier5/ItemTemplarSword";
import { itemBronzeFuryBroadsword } from "./tier6/ItemBronzeFuryBroadsword";
import { itemOceanSaberSword } from "./tier6/ItemOceanSaberSword";
import { itemPixieCutSword } from "./tier6/ItemPixieCutSword";
import { itemTigerSword } from "./tier6/ItemTigerSword";
import { itemCenturionBroadsword } from "./tier7/ItemCenturionBroadsword";
import { itemJadeBlade } from "./tier7/ItemJadeBlade";
import { itemWindCutterSword } from "./tier7/ItemWindCutterSword";
import { itemYggdrasilBroadsword } from "./tier7/ItemYggdrasilBroadsword";
import { itemIronFistSword } from "./tier8/ItemIronFistSword";
import { itemMoonshadeSword } from "./tier8/ItemMoonshadeSword";
import { itemTitanTetherTachiSword } from "./tier8/ItemTitanTetherTachiSword";
import { itemVenomStrikeSword } from "./tier8/ItemVenomStrikeSword";
import { itemGorgonBlade } from "./tier9/ItemGorgonBlade";
import { itemLightBringerSword } from "./tier9/ItemLightBringerSword";
import { itemStellarBlade } from "./tier9/ItemStellarBlade";
import { itemThunderStrikeSword } from "./tier9/ItemThunderStrikeSword";

export const swordsBlueprintIndex = {
  [SwordsBlueprint.ShortSword]: itemShortSword,
  [SwordsBlueprint.BasiliskSword]: itemBasiliskSword,
  [SwordsBlueprint.DragonsSword]: itemDragonsSword,
  [SwordsBlueprint.DoubleEdgedSword]: itemDoubleEdgedSword,
  [SwordsBlueprint.BroadSword]: itemBroadSword,
  [SwordsBlueprint.ElvenSword]: itemElvenSword,
  [SwordsBlueprint.Katana]: itemKatana,
  [SwordsBlueprint.KnightsSword]: itemKnightsSword,
  [SwordsBlueprint.FireSword]: itemFireSword,
  [SwordsBlueprint.IceSword]: itemIceSword,
  [SwordsBlueprint.CorruptionSword]: itemCorruptionSword,
  [SwordsBlueprint.DamascusSword]: itemDamascusSword,
  [SwordsBlueprint.EldensSword]: itemEldensSword,
  [SwordsBlueprint.EnchantedSword]: itemEnchantedSword,
  [SwordsBlueprint.GoldenSword]: itemGoldenSword,
  [SwordsBlueprint.LeviathanSword]: itemLeviathanSword,
  [SwordsBlueprint.LightingSword]: itemLightingSword,
  [SwordsBlueprint.LongSword]: itemLongSword,
  [SwordsBlueprint.MithrilSword]: itemMithrilSword,
  [SwordsBlueprint.Rapier]: itemRapier,
  [SwordsBlueprint.Saber]: itemSaber,
  [SwordsBlueprint.Sword]: itemSword,
  [SwordsBlueprint.WoodenSword]: itemWoodenSword,
  [SwordsBlueprint.YggdrasilJianSword]: itemYggdrasilJianSword,
  [SwordsBlueprint.YggdrasilTemplarSword]: itemYggdrasilTemplarSword,
  [SwordsBlueprint.YggdrasilGladius]: itemYggdrasilGladius,
  [SwordsBlueprint.JianSword]: itemJianSword,
  [SwordsBlueprint.RoyalSword]: itemRoyalSword,
  [SwordsBlueprint.TemplarSword]: itemTemplarSword,
  [SwordsBlueprint.PoisonSword]: itemPoisonSword,
  [SwordsBlueprint.ShadowSword]: itemShadowSword,
  [SwordsBlueprint.CopperBroadsword]: itemCopperBroadsword,
  [SwordsBlueprint.IceShardLongsword]: itemIceShardLongsword,
  [SwordsBlueprint.FrostguardSword]: itemFrostguardSword,
  [SwordsBlueprint.TungstenSword]: itemTungstenSword,
  [SwordsBlueprint.FrostbiteBlade]: itemFrostbiteBlade,
  [SwordsBlueprint.IronwoodTanto]: itemIronwoodTanto,
  [SwordsBlueprint.FalconsSword]: itemFalconsSword,
  [SwordsBlueprint.GlacialSword]: itemGlacialSword,
  [SwordsBlueprint.AzureMachete]: itemAzureMachete,
  [SwordsBlueprint.AngelicSword]: itemAngelicSword,
  [SwordsBlueprint.DiamondSword]: itemDiamondSword,
  [SwordsBlueprint.ElucidatorSword]: itemElucidatorSword,
  [SwordsBlueprint.RoyalGuardianSword]: itemRoyalGuardianSword,
  [SwordsBlueprint.TigerSword]: itemTigerSword,
  [SwordsBlueprint.LightBringerSword]: itemLightBringerSword,
  [SwordsBlueprint.InfernoEdgeSword]: itemInfernoEdgeSword,
  [SwordsBlueprint.WindCutterSword]: itemWindCutterSword,
  [SwordsBlueprint.ThunderStrikeSword]: itemThunderStrikeSword,
  [SwordsBlueprint.MoonshadeSword]: itemMoonshadeSword,
  [SwordsBlueprint.VenomStrikeSword]: itemVenomStrikeSword,
  [SwordsBlueprint.HellfireEdgeSword]: itemHellfireEdgeSword,
  [SwordsBlueprint.EmeraldBroadsword]: itemEmeraldBroadsword,
  [SwordsBlueprint.JadeBlade]: itemJadeBlade,
  [SwordsBlueprint.BronzeFuryBroadsword]: itemBronzeFuryBroadsword,
  [SwordsBlueprint.GorgonBlade]: itemGorgonBlade,
  [SwordsBlueprint.CenturionBroadsword]: itemCenturionBroadsword,
  [SwordsBlueprint.CopperveinBlade]: itemCopperveinBlade,
  [SwordsBlueprint.MinotaurSword]: itemMinotaurSword,
  [SwordsBlueprint.TitaniumBroadsword]: itemTitaniumBroadsword,
  [SwordsBlueprint.WarlordBroadsword]: itemWarlordBroadsword,
  [SwordsBlueprint.GuardianSword]: itemGuardianSword,
  [SwordsBlueprint.ZenBroadsword]: itemZenBroadsword,
  [SwordsBlueprint.PhoenixSword]: itemPhoenixSword,
  [SwordsBlueprint.StellarBlade]: itemStellarBlade,
  [SwordsBlueprint.OceanSaberSword]: itemOceanSaberSword,
  [SwordsBlueprint.IronFistSword]: itemIronFistSword,
  [SwordsBlueprint.GhostTalonSword]: itemGhostTalonSword,
  [SwordsBlueprint.VioletVenomSword]: itemVioletVenomSword,
  [SwordsBlueprint.NemesisSword]: itemNemesisSword,
  [SwordsBlueprint.PixieCutSword]: itemPixieCutSword,
  [SwordsBlueprint.TitanTetherTachiSword]: itemTitanTetherTachiSword,
  [SwordsBlueprint.YggdrasilBroadsword]: itemYggdrasilBroadsword,
  [SwordsBlueprint.EonGuardianSword]: itemEonGuardianSword,
  [SwordsBlueprint.Shadowblade]: itemShadowblade,
  [SwordsBlueprint.FrostwindCutter]: itemFrostwindCutter,
  [SwordsBlueprint.Stormbreaker]: itemStormbreaker,
  [SwordsBlueprint.FlamestrikeBlade]: itemFlamestrikeBlade,
  [SwordsBlueprint.FrostbiteSaber]: itemFrostbiteSaber,
  [SwordsBlueprint.ThunderousClaymore]: itemThunderousClaymore,
  [SwordsBlueprint.VenomousFang]: itemVenomousFang,
  [SwordsBlueprint.CelestialEdge]: itemCelestialEdge,
  [SwordsBlueprint.InfernalSlicer]: itemInfernalSlicer,
  [SwordsBlueprint.MoonlightCrescent]: itemMoonlightCrescent,
  [SwordsBlueprint.FrostfireLongblade]: itemFrostfireLongblade,
  [SwordsBlueprint.SeraphicScimitar]: itemSeraphicScimitar,
  [SwordsBlueprint.ThunderclapKatana]: itemThunderclapKatana,
  [SwordsBlueprint.EmberglowRapier]: itemEmberglowRapier,
  [SwordsBlueprint.FrostheartBroadsword]: itemFrostheartBroadsword,
  [SwordsBlueprint.VenomousStinger]: itemVenomousStinger,
  [SwordsBlueprint.CelestialDefender]: itemCelestialDefender,
  [SwordsBlueprint.ShadowstrikeFalchion]: itemShadowstrikeFalchion,
  [SwordsBlueprint.BloodmoonBlade]: itemBloodmoonBlade,
  [SwordsBlueprint.ThunderboltCutlass]: itemThunderboltCutlass,
  [SwordsBlueprint.InfernoCleaver]: itemInfernoCleaver,
  [SwordsBlueprint.MoonshadowBlade]: itemMoonshadowBlade,
  [SwordsBlueprint.FrostfireGladius]: itemFrostfireGladius,
  [SwordsBlueprint.SeraphicSabre]: itemSeraphicSabre,
  [SwordsBlueprint.ThunderstormEdge]: itemThunderstormEdge,
  [SwordsBlueprint.EmberbrandClaymore]: itemEmberbrandClaymore,
  [SwordsBlueprint.FrostbiteFang]: itemFrostbiteFang,
  [SwordsBlueprint.VenomousBlade]: itemVenomousBlade,
  [SwordsBlueprint.CelestialSaber]: itemCelestialSaber,

  [SwordsBlueprint.ZephyrBlade]: itemZephyrBlade,
  [SwordsBlueprint.CelestialReaver]: itemCelestialReaver,
  [SwordsBlueprint.PhoenixFury]: itemPhoenixFury,
  [SwordsBlueprint.Voidslayer]: itemVoidslayer,
  [SwordsBlueprint.LunarEclipseBlade]: itemLunarEclipseBlade,
  [SwordsBlueprint.StormcallerScimitar]: itemStormcallerScimitar,
  [SwordsBlueprint.ObsidianEdge]: itemObsidianEdge,
  [SwordsBlueprint.AstralSaber]: itemAstralSaber,
  [SwordsBlueprint.SolarFlareSword]: itemSolarFlareSword,
  [SwordsBlueprint.ShadowShredder]: itemShadowShredder,
  [SwordsBlueprint.AuroraBorealisBlade]: itemAuroraBorealisBlade,
  [SwordsBlueprint.BloodthornBroadsword]: itemBloodthornBroadsword,
  [SwordsBlueprint.ThunderclapScimitar]: itemThunderclapScimitar,
  [SwordsBlueprint.Duskblade]: itemDuskblade,
  [SwordsBlueprint.SoulrenderSword]: itemSoulrenderSword,
};
