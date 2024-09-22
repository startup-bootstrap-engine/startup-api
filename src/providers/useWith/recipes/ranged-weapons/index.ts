import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeArrow } from "./ammo/tier0/recipeArrow";
import { recipeBloodseekerBow } from "./tier9/recipeBloodseekerBow";
import { recipeBolt } from "./ammo/tier1/recipeBolt";
import { recipeBow } from "./tier0/recipeBow";
import { recipeChordedCataclysmBow } from "./tier9/recipeChordedCataclysmBow";
import { recipeCorruptionBolt } from "./ammo/tier3/recipeCorruptionBolt";
import { recipeCrossBow } from "./tier1/recipeCrossBow";
import { recipeCrystallineArrow } from "./ammo/tier4/recipeCrystallineArrow";
import { recipeCursedBolt } from "./ammo/tier4/recipeCursedBolt";
import { recipeDragonBow } from "./tier5/recipeDragonBow";
import { recipeDragonWingBow } from "./tier10/recipeDragonWingBow";
import { recipeEbonyLongbow } from "./tier2/recipeEbonyLongbow";
import { recipeElmReflexBow } from "./tier3/recipeElmReflexBow";
import { recipeElvenBolt } from "./ammo/tier3/recipeElvenBolt";
import { recipeFireBolt } from "./ammo/tier3/recipeFireBolt";
import { recipeGaleGuardianGripCrossbow } from "./tier7/recipeGaleGuardianGripCrossbow";
import { recipeGoldenArrow } from "./ammo/tier12/recipeGoldenArrow";
import { recipeGossamerBolt } from "./ammo/tier9/recipeGossamerBolt";
import { recipeHadesBow } from "./tier4/recipeHadesBow";
import { recipeIronArrow } from "./ammo/tier1/recipeIronArrow";
import { recipeIronBarkBow } from "./tier6/recipeIronBarkBow";
import { recipeLightingCrossbow } from "./tier3/recipeLightingCrossbow";
import { recipeMysticMeadowArrow } from "./ammo/tier10/recipeMysticMeadowArrow";
import { recipeParallelPrecisionBow } from "./tier6/recipeParallelPrecisionBow";
import { recipePhoenixBow } from "./tier4/recipePhoenixBow";
import { recipePlasmaPierceArrow } from "./ammo/tier14/recipePlasmaPierceArrow";
import { recipePoisonArrow } from "./ammo/tier2/recipePoisonArrow";
import { recipeRedwoodLongbow } from "./tier3/recipeRedwoodLongbow";
import { recipeRoyalBow } from "./tier4/recipeRoyalBow";
import { recipeRuneBow } from "./tier3/recipeRuneBow";
import { recipeShockArrow } from "./ammo/tier11/recipeShockArrow";
import { recipeSilvermoonArrow } from "./ammo/tier6/recipeSilvermoonArrow";
import { recipeStarsHooterBow } from "./tier11/recipeStarsHooterBow";
import { recipeStoneBreakerBow } from "./tier8/recipeStoneBreakerBow";
import { recipeStormBow } from "./tier5/recipeStormBow";
import { recipeSunstoneBow } from "./tier5/recipeSunstoneBow";
import { recipeUmbralBow } from "./tier12/recipeUmbralBow";
import { recipeValkyriesBow } from "./tier5/recipeValkyriesBow";
import { recipeZephyrusBow } from "./tier5/recipeZephyrusBow";
import { recipeBloodthirstBow } from "./tier10/recipeBloodthirstBow";
import { recipeFalconWingBow } from "./tier10/recipeFalconWingBow";
import { recipeTalonStrikeBow } from "./tier10/recipeTalonStrikeBow";
import { recipeBloodMoonBow } from "./tier11/recipeBloodMoonBow";
import { recipeDarkVeinBow } from "./tier11/recipeDarkVeinBow";
import { recipeHorizonPiercerBow } from "./tier11/recipeHorizonPiercerBow";
import { recipeAerialStrikeBow } from "./tier12/recipeAerialStrikeBow";
import { recipeSanguineShadeBow } from "./tier12/recipeSanguineShadeBow";
import { recipeSkyHunterBow } from "./tier12/recipeSkyHunterBow";
import { recipeFalconEyeBow } from "./tier6/recipeFalconEyeBow";
import { recipeRubyTalonBow } from "./tier6/recipeRubyTalonBow";
import { recipeCrimsonFangBow } from "./tier7/recipeCrimsonFangBow";
import { recipeFalconFeatherBow } from "./tier7/recipeFalconFeatherBow";
import { recipeLifebloodBow } from "./tier7/recipeLifebloodBow";
import { recipeGaleWingBow } from "./tier8/recipeGaleWingBow";
import { recipeVampiricBow } from "./tier8/recipeVampiricBow";
import { recipeNightshadeBow } from "./tier9/recipeNightshadeBow";
import { recipeWindriderBow } from "./tier9/recipeWindriderBow";
import { recipeCorruptionBow } from "./tier2/recipeCorruptionBow";
import { recipeScythianGoldenBow } from "./tier4/recipeScythianGoldenBow";
import { recipeTurkishGoldenBow } from "./tier4/recipeTurkishGoldenBow";
import { recipeYggdrasilBow } from "./tier5/recipeYggdrasilBow";

export const recipeRangedIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [RangedWeaponsBlueprint.Arrow]: [recipeArrow],
  [RangedWeaponsBlueprint.IronArrow]: [recipeIronArrow],
  [RangedWeaponsBlueprint.PoisonArrow]: [recipePoisonArrow],
  [RangedWeaponsBlueprint.Bolt]: [recipeBolt],
  [RangedWeaponsBlueprint.CorruptionBolt]: [recipeCorruptionBolt],
  [RangedWeaponsBlueprint.FireBolt]: [recipeFireBolt],
  [RangedWeaponsBlueprint.ElvenBolt]: [recipeElvenBolt],
  [RangedWeaponsBlueprint.Bow]: [recipeBow],
  [RangedWeaponsBlueprint.DragonBow]: [recipeDragonBow],
  [RangedWeaponsBlueprint.HadesBow]: [recipeHadesBow],
  [RangedWeaponsBlueprint.Crossbow]: [recipeCrossBow],
  [RangedWeaponsBlueprint.GoldenArrow]: [recipeGoldenArrow],
  [RangedWeaponsBlueprint.LightningCrossbow]: [recipeLightingCrossbow],
  [RangedWeaponsBlueprint.PhoenixBow]: [recipePhoenixBow],
  [RangedWeaponsBlueprint.RuneBow]: [recipeRuneBow],
  [RangedWeaponsBlueprint.ShockArrow]: [recipeShockArrow],
  [RangedWeaponsBlueprint.StormBow]: [recipeStormBow],
  [RangedWeaponsBlueprint.SunstoneBow]: [recipeSunstoneBow],
  [RangedWeaponsBlueprint.ValkyriesBow]: [recipeValkyriesBow],
  [RangedWeaponsBlueprint.ZephyrusBow]: [recipeZephyrusBow],
  [RangedWeaponsBlueprint.RoyalBow]: [recipeRoyalBow],
  [RangedWeaponsBlueprint.EbonyLongbow]: [recipeEbonyLongbow],
  [RangedWeaponsBlueprint.ElmReflexBow]: [recipeElmReflexBow],
  [RangedWeaponsBlueprint.RedwoodLongbow]: [recipeRedwoodLongbow],
  [RangedWeaponsBlueprint.BloodseekerBow]: [recipeBloodseekerBow],
  [RangedWeaponsBlueprint.DragonWingBow]: [recipeDragonWingBow],
  [RangedWeaponsBlueprint.IronBarkBow]: [recipeIronBarkBow],
  [RangedWeaponsBlueprint.StarsHooterBow]: [recipeStarsHooterBow],
  [RangedWeaponsBlueprint.StoneBreakerBow]: [recipeStoneBreakerBow],
  [RangedWeaponsBlueprint.UmbralBow]: [recipeUmbralBow],
  [RangedWeaponsBlueprint.CrystallineArrow]: [recipeCrystallineArrow],
  [RangedWeaponsBlueprint.SilvermoonArrow]: [recipeSilvermoonArrow],
  [RangedWeaponsBlueprint.CursedBolt]: [recipeCursedBolt],
  [RangedWeaponsBlueprint.GossamerBolt]: [recipeGossamerBolt],
  [RangedWeaponsBlueprint.ChordedCataclysmBow]: [recipeChordedCataclysmBow],
  [RangedWeaponsBlueprint.GaleGuardianGripCrossbow]: [recipeGaleGuardianGripCrossbow],
  [RangedWeaponsBlueprint.ParallelPrecisionBow]: [recipeParallelPrecisionBow],
  [RangedWeaponsBlueprint.MysticMeadowArrow]: [recipeMysticMeadowArrow],
  [RangedWeaponsBlueprint.PlasmaPierceArrow]: [recipePlasmaPierceArrow],
  [RangedWeaponsBlueprint.FalconFeatherBow]: [recipeFalconFeatherBow],
  [RangedWeaponsBlueprint.FalconWingBow]: [recipeFalconWingBow],
  [RangedWeaponsBlueprint.SkyHunterBow]: [recipeSkyHunterBow],
  [RangedWeaponsBlueprint.AerialStrikeBow]: [recipeAerialStrikeBow],
  [RangedWeaponsBlueprint.WindriderBow]: [recipeWindriderBow],
  [RangedWeaponsBlueprint.FalconEyeBow]: [recipeFalconEyeBow],
  [RangedWeaponsBlueprint.TalonStrikeBow]: [recipeTalonStrikeBow],
  [RangedWeaponsBlueprint.HorizonPiercerBow]: [recipeHorizonPiercerBow],
  [RangedWeaponsBlueprint.GaleWingBow]: [recipeGaleWingBow],
  [RangedWeaponsBlueprint.BloodMoonBow]: [recipeBloodMoonBow],
  [RangedWeaponsBlueprint.VampiricBow]: [recipeVampiricBow],
  [RangedWeaponsBlueprint.CrimsonFangBow]: [recipeCrimsonFangBow],
  [RangedWeaponsBlueprint.SanguineShadeBow]: [recipeSanguineShadeBow],
  [RangedWeaponsBlueprint.LifebloodBow]: [recipeLifebloodBow],
  [RangedWeaponsBlueprint.BloodthirstBow]: [recipeBloodthirstBow],
  [RangedWeaponsBlueprint.NightshadeBow]: [recipeNightshadeBow],
  [RangedWeaponsBlueprint.DarkVeinBow]: [recipeDarkVeinBow],
  [RangedWeaponsBlueprint.RubyTalonBow]: [recipeRubyTalonBow],
  [RangedWeaponsBlueprint.CorruptionBow]: [recipeCorruptionBow],
  [RangedWeaponsBlueprint.ScythianGoldenBow]: [recipeScythianGoldenBow],
  [RangedWeaponsBlueprint.TurkishGoldenBow]: [recipeTurkishGoldenBow],
  [RangedWeaponsBlueprint.YggdrasilBow]: [recipeYggdrasilBow],
};
