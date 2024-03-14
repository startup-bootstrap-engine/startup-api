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
};
