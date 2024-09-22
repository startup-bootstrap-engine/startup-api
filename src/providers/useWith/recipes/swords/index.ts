import { SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeWoodenSword } from "./tier0/recipeWoodenSword";
import { recipeBroadSword } from "./tier1/recipeBroadSword";
import { recipeElvenSword } from "./tier1/recipeElvenSword";
import { recipeIronwoodTanto } from "./tier1/recipeIceIronwoodTanto";
import { recipeKatana } from "./tier1/recipeKatana";
import { recipeDiamondSword } from "./tier10/recipeDiamondSword";
import { recipeElucidatorSword } from "./tier10/recipeElucidatorSword";
import { recipeRoyalGuardianSword } from "./tier10/recipeRoyalGuardianSword";
import { recipeTitaniumBroadsword } from "./tier10/recipeTitaniumBroadsword";
import { recipeVioletVenomSword } from "./tier10/recipeVioletVenomSword";
import { recipeHellfireEdgeSword } from "./tier11/recipeHellfireEdgeSword";
import { recipeInfernoEdgeSword } from "./tier11/recipeInfernoEdgeSword";
import { recipeMinotaurSword } from "./tier11/recipeMinotaurSword";
import { recipeNemesisSword } from "./tier11/recipeNemesisSword";
import { recipeEmeraldBroadsword } from "./tier12/recipeEmeraldBroadsword";
import { recipeGhostTalonSword } from "./tier12/recipeGhostTalonSword";
import { recipePhoenixSword } from "./tier12/recipePhoenixSword";
import { recipeWarlordBroadsword } from "./tier12/recipeWarlordBroadsword";
import { recipeZenBroadsword } from "./tier12/recipeZenBroadsword";
import { recipeYggdrasilJianSword } from "./tier13/recipeYggdrasilJianSword";
import { recipeFrostbitFang } from "./tier14/recipeFrostbiteFang";
import { recipeObsidianEdge } from "./tier14/recipeObsidianEdge";
import { recipeShadowstrikeFalchion } from "./tier14/recipeShadowstrikeFalchion";
import { recipeStormcallerScimitar } from "./tier14/recipeStormcallerScimitar";
import { recipeVenomousBlade } from "./tier14/recipeVenomousBlade";
import { recipeVenomousSinger } from "./tier14/recipeVenomousStinger";
import { recipeAstralSaber } from "./tier15/recipeAstralSaber";
import { recipeFlamestrikeBlade } from "./tier15/recipeFlamestrikeBlade";
import { recipeMoonshadowBlade } from "./tier15/recipeMoonshadowBlade";
import { recipeShadowblade } from "./tier15/recipeShadowblade";
import { recipeSolarFlareSword } from "./tier15/recipeSolarFlareSword";
import { recipeThunderCutlass } from "./tier15/recipeThunderCutlass";
import { recipeVenomousFang } from "./tier15/recipeVenomousFang";
import { recipeYggdrasilTemplarSword } from "./tier15/recipeYggdrasilTemplarSword";
import { recipeAuroraBorealisBlade } from "./tier16/recipeAuroraBorealisBlade";
import { recipeBloodmoonBlade } from "./tier16/recipeBloodmoonBlade";
import { recipeEmberbrandClaymore } from "./tier16/recipeEmberbrandClaymore";
import { recipeEmberglowRapier } from "./tier16/recipeEmberglowRapier";
import { recipeFrostheartBroadsword } from "./tier16/recipeFrostheartBroadsword";
import { recipeSeraphicSaber } from "./tier16/recipeSeraphicSabre";
import { recipeSeraphicScimitar } from "./tier16/recipeSeraphicScimitar";
import { recipeShadowShredder } from "./tier16/recipeShadowShredder";
import { recipeThunderousClaymore } from "./tier16/recipeThunderousClaymore";
import { recipeBloodthornBroadsword } from "./tier17/recipeBloodthornBroadsword";
import { recipeCelestialEdge } from "./tier17/recipeCelestialEdge";
import { recipeCelestialSaber } from "./tier17/recipeCelestialSaber";
import { recipeFrostfireLongblade } from "./tier17/recipeFrostfireLongblade";
import { recipeMoonlightCrescent } from "./tier17/recipeMoonlightCrescent";
import { recipeStormbreaker } from "./tier17/recipeStormbreaker";
import { recipeThunderclapKatana } from "./tier17/recipeThunderclapKatana";
import { recipeThunderclapScimitar } from "./tier17/recipeThunderclapScimitar";
import { recipeThunderstormEdge } from "./tier17/recipeThunderstormEdge";
import { recipeCelestialDefender } from "./tier18/recipeCelestialDefender";
import { recipeDuskblade } from "./tier18/recipeDuskblade";
import { recipeFrostbiteSaber } from "./tier18/recipeFrostbiteSaber";
import { recipeFrostfireGladius } from "./tier18/recipeFrostfireGladius";
import { recipeFrostwindCutter } from "./tier18/recipeFrostwindCutter";
import { recipeInfernalSlicer } from "./tier18/recipeInfernalSlicer";
import { recipeSoulrenderSword } from "./tier18/recipeSoulrenderSword";
import { recipeCopperBroadsword } from "./tier2/recipeCopperBroadsword";
import { recipeIceSword } from "./tier2/recipeIceSword";
import { recipeBasiliskSword } from "./tier3/recipeBasiliskSword";
import { recipeCorruptionSword } from "./tier3/recipeCorruptionSword";
import { recipeFrostbiteBlade } from "./tier3/recipeFrostbiteBlade";
import { recipeFrostguardSword } from "./tier3/recipeFrostguardSword";
import { recipeFireSword } from "./tier4/recipeFireSword";
import { recipeIceShardLongsword } from "./tier4/recipeIceShardLongsword";
import { recipeMithrilSword } from "./tier4/recipeMithrilSword";
import { recipeTungstenSword } from "./tier4/recipeTungstenSword";
import { recipeBronzeFuryBroadsword } from "./tier6/recipeBronzeFuryBroadsword";
import { recipeOceanSaberSword } from "./tier6/recipeOceanSaberSword";
import { recipeTigerSword } from "./tier6/recipeTigerSword";
import { recipeCenturionBroadsword } from "./tier7/recipeCenturionBroadsword";
import { recipeJadeBlade } from "./tier7/recipeJadeBlade";
import { recipeYggdrasilBroadsword } from "./tier7/recipeYggdrasilBroadsword";
import { recipeMoonshadeSword } from "./tier8/recipeMoonshadeSword";
import { recipeVenomStrikeSword } from "./tier8/recipeVenomStrikeSword";
import { recipeGorgonBlade } from "./tier9/recipeGorgonBlade";
import { recipeLightBringerSword } from "./tier9/recipeLightBringerSword";
import { recipeThunderStrikeSword } from "./tier9/recipeThunderStrikeSword";
import { recipeZephyrBlade } from "./tier11/recipeZephyrBlade";
import { recipeCelestialReaver } from "./tier12/recipeCelestialReaver";
import { recipePhoenixFury } from "./tier12/recipePhoenixFury";
import { recipeLunarEclipseBlade } from "./tier13/recipeLunarEclipseBlade";
import { recipeVoidslayer } from "./tier13/recipeVoidSlayer";
import { recipeDamascusSword } from "./tier3/recipeDamascusSword ";

export const recipeSwordsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [SwordsBlueprint.ElvenSword]: [recipeElvenSword],
  [SwordsBlueprint.FireSword]: [recipeFireSword],
  [SwordsBlueprint.IceSword]: [recipeIceSword],
  [SwordsBlueprint.BasiliskSword]: [recipeBasiliskSword],
  [SwordsBlueprint.BroadSword]: [recipeBroadSword],
  [SwordsBlueprint.Katana]: [recipeKatana],
  [SwordsBlueprint.MithrilSword]: [recipeMithrilSword],
  [SwordsBlueprint.CorruptionSword]: [recipeCorruptionSword],
  [SwordsBlueprint.CopperBroadsword]: [recipeCopperBroadsword],
  [SwordsBlueprint.FrostguardSword]: [recipeFrostguardSword],
  [SwordsBlueprint.FrostbiteBlade]: [recipeFrostbiteBlade],
  [SwordsBlueprint.IronwoodTanto]: [recipeIronwoodTanto],
  [SwordsBlueprint.IceShardLongsword]: [recipeIceShardLongsword],
  [SwordsBlueprint.TungstenSword]: [recipeTungstenSword],
  [SwordsBlueprint.WoodenSword]: [recipeWoodenSword],
  [SwordsBlueprint.InfernoEdgeSword]: [recipeInfernoEdgeSword],
  [SwordsBlueprint.BronzeFuryBroadsword]: [recipeBronzeFuryBroadsword],
  [SwordsBlueprint.CenturionBroadsword]: [recipeCenturionBroadsword],
  [SwordsBlueprint.DiamondSword]: [recipeDiamondSword],
  [SwordsBlueprint.ElucidatorSword]: [recipeElucidatorSword],
  [SwordsBlueprint.EmeraldBroadsword]: [recipeEmeraldBroadsword],
  [SwordsBlueprint.GhostTalonSword]: [recipeGhostTalonSword],
  [SwordsBlueprint.GorgonBlade]: [recipeGorgonBlade],
  [SwordsBlueprint.HellfireEdgeSword]: [recipeHellfireEdgeSword],
  [SwordsBlueprint.JadeBlade]: [recipeJadeBlade],
  [SwordsBlueprint.LightBringerSword]: [recipeLightBringerSword],
  [SwordsBlueprint.MinotaurSword]: [recipeMinotaurSword],
  [SwordsBlueprint.MoonshadeSword]: [recipeMoonshadeSword],
  [SwordsBlueprint.NemesisSword]: [recipeNemesisSword],
  [SwordsBlueprint.OceanSaberSword]: [recipeOceanSaberSword],
  [SwordsBlueprint.PhoenixSword]: [recipePhoenixSword],
  [SwordsBlueprint.RoyalGuardianSword]: [recipeRoyalGuardianSword],
  [SwordsBlueprint.ThunderStrikeSword]: [recipeThunderStrikeSword],
  [SwordsBlueprint.TigerSword]: [recipeTigerSword],
  [SwordsBlueprint.TitaniumBroadsword]: [recipeTitaniumBroadsword],
  [SwordsBlueprint.VenomStrikeSword]: [recipeVenomStrikeSword],
  [SwordsBlueprint.VioletVenomSword]: [recipeVioletVenomSword],
  [SwordsBlueprint.ZenBroadsword]: [recipeZenBroadsword],
  [SwordsBlueprint.YggdrasilBroadsword]: [recipeYggdrasilBroadsword],
  [SwordsBlueprint.WarlordBroadsword]: [recipeWarlordBroadsword],
  [SwordsBlueprint.YggdrasilJianSword]: [recipeYggdrasilJianSword],
  [SwordsBlueprint.FrostbiteFang]: [recipeFrostbitFang],
  [SwordsBlueprint.ShadowstrikeFalchion]: [recipeShadowstrikeFalchion],
  [SwordsBlueprint.VenomousBlade]: [recipeVenomousBlade],
  [SwordsBlueprint.VenomousStinger]: [recipeVenomousSinger],
  [SwordsBlueprint.FlamestrikeBlade]: [recipeFlamestrikeBlade],
  [SwordsBlueprint.MoonshadowBlade]: [recipeMoonshadowBlade],
  [SwordsBlueprint.Shadowblade]: [recipeShadowblade],
  [SwordsBlueprint.ThunderboltCutlass]: [recipeThunderCutlass],
  [SwordsBlueprint.VenomousFang]: [recipeVenomousFang],
  [SwordsBlueprint.YggdrasilTemplarSword]: [recipeYggdrasilTemplarSword],
  [SwordsBlueprint.BloodmoonBlade]: [recipeBloodmoonBlade],
  [SwordsBlueprint.EmberbrandClaymore]: [recipeEmberbrandClaymore],
  [SwordsBlueprint.EmberglowRapier]: [recipeEmberglowRapier],
  [SwordsBlueprint.FrostheartBroadsword]: [recipeFrostheartBroadsword],
  [SwordsBlueprint.SeraphicSabre]: [recipeSeraphicSaber],
  [SwordsBlueprint.SeraphicScimitar]: [recipeSeraphicScimitar],
  [SwordsBlueprint.ThunderousClaymore]: [recipeThunderousClaymore],
  [SwordsBlueprint.CelestialEdge]: [recipeCelestialEdge],
  [SwordsBlueprint.CelestialSaber]: [recipeCelestialSaber],
  [SwordsBlueprint.FrostfireLongblade]: [recipeFrostfireLongblade],
  [SwordsBlueprint.MoonlightCrescent]: [recipeMoonlightCrescent],
  [SwordsBlueprint.Stormbreaker]: [recipeStormbreaker],
  [SwordsBlueprint.ThunderclapKatana]: [recipeThunderclapKatana],
  [SwordsBlueprint.ThunderstormEdge]: [recipeThunderstormEdge],
  [SwordsBlueprint.CelestialDefender]: [recipeCelestialDefender],
  [SwordsBlueprint.FrostbiteSaber]: [recipeFrostbiteSaber],
  [SwordsBlueprint.FrostfireGladius]: [recipeFrostfireGladius],
  [SwordsBlueprint.FrostwindCutter]: [recipeFrostwindCutter],
  [SwordsBlueprint.InfernalSlicer]: [recipeInfernalSlicer],
  [SwordsBlueprint.SolarFlareSword]: [recipeSolarFlareSword],
  [SwordsBlueprint.AuroraBorealisBlade]: [recipeAuroraBorealisBlade],
  [SwordsBlueprint.ShadowShredder]: [recipeShadowShredder],
  [SwordsBlueprint.BloodthornBroadsword]: [recipeBloodthornBroadsword],
  [SwordsBlueprint.Duskblade]: [recipeDuskblade],
  [SwordsBlueprint.ObsidianEdge]: [recipeObsidianEdge],
  [SwordsBlueprint.StormcallerScimitar]: [recipeStormcallerScimitar],
  [SwordsBlueprint.AstralSaber]: [recipeAstralSaber],
  [SwordsBlueprint.ThunderclapScimitar]: [recipeThunderclapScimitar],
  [SwordsBlueprint.SoulrenderSword]: [recipeSoulrenderSword],
  [SwordsBlueprint.Voidslayer]: [recipeVoidslayer],
  [SwordsBlueprint.LunarEclipseBlade]: [recipeLunarEclipseBlade],
  [SwordsBlueprint.PhoenixFury]: [recipePhoenixFury],
  [SwordsBlueprint.CelestialReaver]: [recipeCelestialReaver],
  [SwordsBlueprint.ZephyrBlade]: [recipeZephyrBlade],
  [SwordsBlueprint.DamascusSword]: [recipeDamascusSword],
};
