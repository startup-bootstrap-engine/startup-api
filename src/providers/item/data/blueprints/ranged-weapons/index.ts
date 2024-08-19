import { RangedWeaponsBlueprint } from "../../types/itemsBlueprintTypes";
import { itemArrow } from "./ammo/tier0/ItemArrow";
import { itemStone } from "./ammo/tier0/ItemStone";
import { itemWoodenArrow } from "./ammo/tier0/ItemWoodenArrow";
import { itemBolt } from "./ammo/tier1/ItemBolt";
import { itemIronArrow } from "./ammo/tier1/ItemIronArrow";
import { itemMysticMeadowArrow } from "./ammo/tier10/ItemMysticMeadowArrow";
import { itemShockArrow } from "./ammo/tier11/ItemShockArrow";
import { itemGoldenArrow } from "./ammo/tier12/ItemGoldenArrow";
import { itemSunflareArrow } from "./ammo/tier13/ItemSunflareArrow";
import { itemPlasmaPierceArrow } from "./ammo/tier14/ItemPlasmaPierceArrow";
import { itemEarthArrow } from "./ammo/tier2/ItemEarthArrow";
import { itemFrostArrow } from "./ammo/tier2/ItemFrostArrow";
import { itemPoisonArrow } from "./ammo/tier2/ItemPoisonArrow";
import { itemCorruptionBolt } from "./ammo/tier3/ItemCorruptionBolt";
import { itemElvenBolt } from "./ammo/tier3/ItemElvenBolt";
import { itemFireBolt } from "./ammo/tier3/ItemFireBolt";
import { itemCrimsonArrow } from "./ammo/tier4/ItemCrimsonArrow";
import { itemCrystallineArrow } from "./ammo/tier4/ItemCrystallineArrow";
import { itemCursedBolt } from "./ammo/tier4/ItemCursedBolt";
import { itemEmeraldArrow } from "./ammo/tier5/ItemEmeraldArrow";
import { itemSilvermoonArrow } from "./ammo/tier6/ItemSilvermoonArrow";
import { itemHeartseekerArrow } from "./ammo/tier7/ItemHeartseekerArrow";
import { itemSeekerArrow } from "./ammo/tier7/ItemSeekerArrow";
import { itemWardenArrow } from "./ammo/tier8/ItemWardenArrow";
import { itemGossamerBolt } from "./ammo/tier9/ItemGossamerBolt";
import { itemBow } from "./tier0/ItemBow";
import { itemSlingshot } from "./tier0/ItemSlingshot";
import { itemWoodenBow } from "./tier0/ItemWoodenBow";
import { itemCompoundBow } from "./tier1/ItemCompoundBow";
import { itemCrossbow } from "./tier1/ItemCrossbow";
import { itemElvenBow } from "./tier1/ItemElvenBow";
import { itemHorseBow } from "./tier1/ItemHorseBow";
import { itemShortBow } from "./tier1/ItemShortBow";
import { itemShuriken } from "./tier1/ItemShuriken";
import { itemBloodthirstBow } from "./tier10/ItemBloodthirstBow";
import { itemDragonWingBow } from "./tier10/ItemDragonWingBow";
import { itemFalconWingBow } from "./tier10/ItemFalconWingBow";
import { itemTalonStrikeBow } from "./tier10/ItemTalonStrikeBow";
import { itemBloodMoonBow } from "./tier11/ItemBloodMoonBow";
import { itemDarkVeinBow } from "./tier11/ItemDarkVeinBow";
import { itemHorizonPiercerBow } from "./tier11/ItemHorizonPiercerBow";
import { itemStarsHooterBow } from "./tier11/ItemStarsHooterBow";
import { itemAerialStrikeBow } from "./tier12/ItemAerialStrikeBow";
import { itemSanguineShadeBow } from "./tier12/ItemSanguineShadeBow";
import { itemSkyHunterBow } from "./tier12/ItemSkyHunterBow";
import { itemUmbralBow } from "./tier12/ItemUmbralBow";
import { itemCorruptionBow } from "./tier2/ItemCorruptionBow";
import { itemEbonyLongbow } from "./tier2/ItemEbonyLongbow";
import { itemFrostBow } from "./tier2/ItemFrostBow";
import { itemFrostCrossbow } from "./tier2/ItemFrostCrossbow";
import { itemHuntersBow } from "./tier2/ItemHuntersBow";
import { itemLongBow } from "./tier2/ItemLongBow";
import { itemOrcishBow } from "./tier2/ItemOrcishBow";
import { itemAsterionsBow } from "./tier3/ItemAsterionsBow";
import { itemEldensBow } from "./tier3/ItemEldensBow";
import { itemElmReflexBow } from "./tier3/ItemElmReflexBow";
import { itemLightningCrossbow } from "./tier3/ItemLightningCrossbow";
import { itemRedwoodLongbow } from "./tier3/ItemRedwoodLongbow";
import { itemRuneBow } from "./tier3/ItemRuneBow";
import { itemRuneCrossbow } from "./tier3/ItemRuneCrossbow";
import { itemHadesBow } from "./tier4/ItemHadesBow";
import { itemHellishBow } from "./tier4/ItemHellishBow";
import { itemPhoenixBow } from "./tier4/ItemPhoenixBow";
import { itemRoyalBow } from "./tier4/ItemRoyalBow";
import { itemRoyalCrossbow } from "./tier4/ItemRoyalCrossbow";
import { itemScythianGoldenBow } from "./tier4/ItemScythianGoldenBow";
import { itemTurkishGoldenBow } from "./tier4/ItemTurkishGoldenBow";
import { itemDragonBow } from "./tier5/ItemDragonBow";
import { itemStormBow } from "./tier5/ItemStormBow";
import { itemSunstoneBow } from "./tier5/ItemSunstoneBow";
import { itemValkyriesBow } from "./tier5/ItemValkyriesBow";
import { itemYggdrasilBow } from "./tier5/ItemYggdrasilBow";
import { itemZephyrusBow } from "./tier5/ItemZephyrusBow";
import { itemFalconEyeBow } from "./tier6/ItemFalconEyeBow";
import { itemIronBarkBow } from "./tier6/ItemIronBarkBow";
import { itemParallelPrecisionBow } from "./tier6/ItemParallelPrecisionBow";
import { itemRubyTalonBow } from "./tier6/ItemRubyTalonBow";
import { itemWhisperWindBow } from "./tier6/ItemWhisperWindBow";
import { itemCrimsonFangBow } from "./tier7/ItemCrimsonFangBow";
import { itemEaglesEyeBow } from "./tier7/ItemEaglesEyeBow";
import { itemFalconFeatherBow } from "./tier7/ItemFalconFeatherBow";
import { itemGaleGuardianGripCrossbow } from "./tier7/ItemGaleGuardianGripCrossbow";
import { itemLifebloodBow } from "./tier7/ItemLifebloodBow";
import { itemGaleWingBow } from "./tier8/ItemGaleWingBow";
import { itemStoneBreakerBow } from "./tier8/ItemStoneBreakerBow";
import { itemTempestTalonTautBow } from "./tier8/ItemTempestTalonTautBow";
import { itemVampiricBow } from "./tier8/ItemVampiricBow";
import { itemBloodseekerBow } from "./tier9/ItemBloodseekerBow";
import { itemChordedCataclysmBow } from "./tier9/ItemChordedCataclysmBow";
import { itemGorgonGazeGuardianBow } from "./tier9/ItemGorgonGazeGuardianBow";
import { itemNightshadeBow } from "./tier9/ItemNightshadeBow";
import { itemWindriderBow } from "./tier9/ItemWindriderBow";

export const rangedWeaponsBlueprintIndex = {
  [RangedWeaponsBlueprint.Slingshot]: itemSlingshot,
  [RangedWeaponsBlueprint.Stone]: itemStone,
  [RangedWeaponsBlueprint.Shuriken]: itemShuriken,
  [RangedWeaponsBlueprint.Arrow]: itemArrow,
  [RangedWeaponsBlueprint.Crossbow]: itemCrossbow,
  [RangedWeaponsBlueprint.Bolt]: itemBolt,
  [RangedWeaponsBlueprint.Bow]: itemBow,
  [RangedWeaponsBlueprint.OrcishBow]: itemOrcishBow,
  [RangedWeaponsBlueprint.FrostBow]: itemFrostBow,
  [RangedWeaponsBlueprint.FrostCrossbow]: itemFrostCrossbow,
  [RangedWeaponsBlueprint.EmeraldArrow]: itemEmeraldArrow,
  [RangedWeaponsBlueprint.FrostArrow]: itemFrostArrow,
  [RangedWeaponsBlueprint.IronArrow]: itemIronArrow,
  [RangedWeaponsBlueprint.CrimsonArrow]: itemCrimsonArrow,
  [RangedWeaponsBlueprint.AsterionsBow]: itemAsterionsBow,
  [RangedWeaponsBlueprint.CompoundBow]: itemCompoundBow,
  [RangedWeaponsBlueprint.CorruptionBolt]: itemCorruptionBolt,
  [RangedWeaponsBlueprint.CorruptionBow]: itemCorruptionBow,
  [RangedWeaponsBlueprint.EldensBow]: itemEldensBow,
  [RangedWeaponsBlueprint.ElvenBolt]: itemElvenBolt,
  [RangedWeaponsBlueprint.ElvenBow]: itemElvenBow,
  [RangedWeaponsBlueprint.FireBolt]: itemFireBolt,
  [RangedWeaponsBlueprint.HellishBow]: itemHellishBow,
  [RangedWeaponsBlueprint.HorseBow]: itemHorseBow,
  [RangedWeaponsBlueprint.HuntersBow]: itemHuntersBow,
  [RangedWeaponsBlueprint.LongBow]: itemLongBow,
  [RangedWeaponsBlueprint.RoyalBow]: itemRoyalBow,
  [RangedWeaponsBlueprint.RoyalCrossbow]: itemRoyalCrossbow,
  [RangedWeaponsBlueprint.ShortBow]: itemShortBow,
  [RangedWeaponsBlueprint.ScythianGoldenBow]: itemScythianGoldenBow,
  [RangedWeaponsBlueprint.TurkishGoldenBow]: itemTurkishGoldenBow,
  [RangedWeaponsBlueprint.YggdrasilBow]: itemYggdrasilBow,
  [RangedWeaponsBlueprint.PoisonArrow]: itemPoisonArrow,
  [RangedWeaponsBlueprint.GoldenArrow]: itemGoldenArrow,
  [RangedWeaponsBlueprint.ShockArrow]: itemShockArrow,
  [RangedWeaponsBlueprint.RuneCrossbow]: itemRuneCrossbow,
  [RangedWeaponsBlueprint.LightningCrossbow]: itemLightningCrossbow,
  [RangedWeaponsBlueprint.ZephyrusBow]: itemZephyrusBow,
  [RangedWeaponsBlueprint.ValkyriesBow]: itemValkyriesBow,
  [RangedWeaponsBlueprint.StormBow]: itemStormBow,
  [RangedWeaponsBlueprint.RuneBow]: itemRuneBow,
  [RangedWeaponsBlueprint.PhoenixBow]: itemPhoenixBow,
  [RangedWeaponsBlueprint.DragonBow]: itemDragonBow,
  [RangedWeaponsBlueprint.SunstoneBow]: itemSunstoneBow,
  [RangedWeaponsBlueprint.HadesBow]: itemHadesBow,
  [RangedWeaponsBlueprint.WoodenArrow]: itemWoodenArrow,
  [RangedWeaponsBlueprint.WoodenBow]: itemWoodenBow,
  [RangedWeaponsBlueprint.RedwoodLongbow]: itemRedwoodLongbow,
  [RangedWeaponsBlueprint.ElmReflexBow]: itemElmReflexBow,
  [RangedWeaponsBlueprint.EbonyLongbow]: itemEbonyLongbow,
  [RangedWeaponsBlueprint.EaglesEyeBow]: itemEaglesEyeBow,
  [RangedWeaponsBlueprint.StarsHooterBow]: itemStarsHooterBow,
  [RangedWeaponsBlueprint.BloodseekerBow]: itemBloodseekerBow,
  [RangedWeaponsBlueprint.StoneBreakerBow]: itemStoneBreakerBow,
  [RangedWeaponsBlueprint.DragonWingBow]: itemDragonWingBow,
  [RangedWeaponsBlueprint.WhisperWindBow]: itemWhisperWindBow,
  [RangedWeaponsBlueprint.IronBarkBow]: itemIronBarkBow,
  [RangedWeaponsBlueprint.UmbralBow]: itemUmbralBow,
  [RangedWeaponsBlueprint.HeartseekerArrow]: itemHeartseekerArrow,
  [RangedWeaponsBlueprint.CrystallineArrow]: itemCrystallineArrow,
  [RangedWeaponsBlueprint.SilvermoonArrow]: itemSilvermoonArrow,
  [RangedWeaponsBlueprint.SeekerArrow]: itemSeekerArrow,
  [RangedWeaponsBlueprint.EarthArrow]: itemEarthArrow,
  [RangedWeaponsBlueprint.CursedBolt]: itemCursedBolt,
  [RangedWeaponsBlueprint.GossamerBolt]: itemGossamerBolt,
  [RangedWeaponsBlueprint.SunflareArrow]: itemSunflareArrow,
  [RangedWeaponsBlueprint.WardenArrow]: itemWardenArrow,
  [RangedWeaponsBlueprint.TempestTalonTautBow]: itemTempestTalonTautBow,
  [RangedWeaponsBlueprint.ChordedCataclysmBow]: itemChordedCataclysmBow,
  [RangedWeaponsBlueprint.ParallelPrecisionBow]: itemParallelPrecisionBow,
  [RangedWeaponsBlueprint.GorgonGazeGuardianBow]: itemGorgonGazeGuardianBow,
  [RangedWeaponsBlueprint.GaleGuardianGripCrossbow]: itemGaleGuardianGripCrossbow,
  [RangedWeaponsBlueprint.MysticMeadowArrow]: itemMysticMeadowArrow,
  [RangedWeaponsBlueprint.PlasmaPierceArrow]: itemPlasmaPierceArrow,
  [RangedWeaponsBlueprint.FalconFeatherBow]: itemFalconFeatherBow,
  [RangedWeaponsBlueprint.FalconWingBow]: itemFalconWingBow,
  [RangedWeaponsBlueprint.SkyHunterBow]: itemSkyHunterBow,
  [RangedWeaponsBlueprint.AerialStrikeBow]: itemAerialStrikeBow,
  [RangedWeaponsBlueprint.WindriderBow]: itemWindriderBow,
  [RangedWeaponsBlueprint.FalconEyeBow]: itemFalconEyeBow,
  [RangedWeaponsBlueprint.TalonStrikeBow]: itemTalonStrikeBow,
  [RangedWeaponsBlueprint.HorizonPiercerBow]: itemHorizonPiercerBow,
  [RangedWeaponsBlueprint.GaleWingBow]: itemGaleWingBow,
  [RangedWeaponsBlueprint.BloodMoonBow]: itemBloodMoonBow,
  [RangedWeaponsBlueprint.VampiricBow]: itemVampiricBow,
  [RangedWeaponsBlueprint.CrimsonFangBow]: itemCrimsonFangBow,
  [RangedWeaponsBlueprint.SanguineShadeBow]: itemSanguineShadeBow,
  [RangedWeaponsBlueprint.LifebloodBow]: itemLifebloodBow,
  [RangedWeaponsBlueprint.BloodthirstBow]: itemBloodthirstBow,
  [RangedWeaponsBlueprint.NightshadeBow]: itemNightshadeBow,
  [RangedWeaponsBlueprint.DarkVeinBow]: itemDarkVeinBow,
  [RangedWeaponsBlueprint.RubyTalonBow]: itemRubyTalonBow,
};
