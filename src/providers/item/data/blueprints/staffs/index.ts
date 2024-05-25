import { StaffsBlueprint } from "../../types/itemsBlueprintTypes";
import { itemAirWand } from "./tier0/ItemAirWand";
import { itemWand } from "./tier0/ItemWand";
import { itemWoodenStaff } from "./tier0/ItemWoodenStaff";
import { itemAppendicesStaff } from "./tier1/ItemAppendicesStaff";
import { itemFireWand } from "./tier1/ItemFireWand";
import { itemPoisonWand } from "./tier1/ItemPoisonWand";
import { itemFireburstWand } from "./tier10/ItemFireburstWand";
import { itemWinterspireStaff } from "./tier10/ItemWinterspireStaff";
import { itemOracleStaff } from "./tier10/itemOracleStaff";
import { itemRainbowWand } from "./tier10/itemRainbowWand";
import { itemSolarStaff } from "./tier11/ItemSolarStaff";
import { itemProphecyStaff } from "./tier11/itemProphecyStaff";
import { itemThunderBoltStaff } from "./tier11/itemThunderBoltStaff";
import { itemVortexStaff } from "./tier12/ItemVortexStaff";
import { itemLightningWand } from "./tier12/itemLightningWand";
import { itemStormStaff } from "./tier12/itemStormStaff";
import { itemLunarWand } from "./tier13/ItemLunarWand";
import { itemDarkMoonStaff } from "./tier13/itemDarkMoonStaff";
import { itemSparklingStaff } from "./tier13/itemSparklingStaff";
import { itemStormyWand } from "./tier13/itemStormyWand";
import { itemElementalStaff } from "./tier14/ItemElementalStaff";
import { itemHellishBronzeStaff } from "./tier14/ItemHellishBronzeStaff";
import { itemFlameSecretWand } from "./tier14/itemFlameSecretWand";
import { itemGhostFireStaff } from "./tier14/itemGhostFireStaff";
import { itemGaleforceStaff } from "./tier15/ItemGaleforceStaff";
import { itemGravityStaff } from "./tier15/ItemGravityStaff";
import { itemDoomsdayStaff } from "./tier15/itemDoomsdayStaff";
import { itemFireHeartStaff } from "./tier15/itemFireHeartStaff";
import { itemDoomStaff } from "./tier16/ItemDoomStaff";
import { itemElysianEyeStaff } from "./tier16/ItemElysianEyeStaff";
import { itemAshwoodstaff } from "./tier16/itemAshwoodstaff";
import { itemMysticLightningStaff } from "./tier16/itemMysticLightningStaff";
import { itemShadowLordWand } from "./tier16/itemShadowLordWand";
import { itemAquaStaff } from "./tier2/ItemAquaStaff";
import { itemCorruptionStaff } from "./tier2/ItemCorruptionStaff";
import { itemSoulStaff } from "./tier2/ItemSoulStaff";
import { itemEmberward } from "./tier3/ItemEmberward";
import { itemFireStaff } from "./tier3/ItemFireStaff";
import { itemPoisonStaff } from "./tier3/ItemPoisonStaff";
import { itemEnchantedStaff } from "./tier4/ItemEnchantedStaff";
import { itemHellishStaff } from "./tier4/ItemHellishStaff";
import { itemMoonsStaff } from "./tier4/ItemMoonsStaff";
import { itemRubyStaff } from "./tier4/ItemRubyStaff";
import { itemSkyBlueStaff } from "./tier4/ItemSkyBlueStaff";
import { itemRoyalStaff } from "./tier5/ItemRoyalStaff";
import { itemSangriaStaff } from "./tier5/ItemSangriaStaff";
import { itemTartarusStaff } from "./tier5/ItemTartarusStaff";
import { itemEagleEyeWand } from "./tier6/ItemEagleEyeWand";
import { itemSpellbinderWand } from "./tier7/ItemSpellbinderWand";
import { itemNaturesWand } from "./tier8/ItemNaturesWand";
import { itemFrostbiteWand } from "./tier9/ItemFrostbiteWand";
import { itemSerpentWand } from "./tier9/ItemSerpentWand";

export const staffsBlueprintIndex = {
  [StaffsBlueprint.AppendicesStaff]: itemAppendicesStaff,
  [StaffsBlueprint.CorruptionStaff]: itemCorruptionStaff,
  [StaffsBlueprint.FireStaff]: itemFireStaff,
  [StaffsBlueprint.AirWand]: itemAirWand,
  [StaffsBlueprint.EnchantedStaff]: itemEnchantedStaff,
  [StaffsBlueprint.FireWand]: itemFireWand,
  [StaffsBlueprint.MoonsStaff]: itemMoonsStaff,
  [StaffsBlueprint.PoisonStaff]: itemPoisonStaff,
  [StaffsBlueprint.PoisonWand]: itemPoisonWand,
  [StaffsBlueprint.RoyalStaff]: itemRoyalStaff,
  [StaffsBlueprint.RubyStaff]: itemRubyStaff,
  [StaffsBlueprint.SoulStaff]: itemSoulStaff,
  [StaffsBlueprint.Wand]: itemWand,
  [StaffsBlueprint.HellishStaff]: itemHellishStaff,
  [StaffsBlueprint.HellishBronzeStaff]: itemHellishBronzeStaff,
  [StaffsBlueprint.WoodenStaff]: itemWoodenStaff,
  [StaffsBlueprint.SangriaStaff]: itemSangriaStaff,
  [StaffsBlueprint.TartarusStaff]: itemTartarusStaff,
  [StaffsBlueprint.AquaStaff]: itemAquaStaff,
  [StaffsBlueprint.SkyBlueStaff]: itemSkyBlueStaff,
  [StaffsBlueprint.Emberward]: itemEmberward,
  [StaffsBlueprint.GaleforceStaff]: itemGaleforceStaff,
  [StaffsBlueprint.FireburstWand]: itemFireburstWand,
  [StaffsBlueprint.VortexStaff]: itemVortexStaff,
  [StaffsBlueprint.WinterspireStaff]: itemWinterspireStaff,
  [StaffsBlueprint.SpellbinderWand]: itemSpellbinderWand,
  [StaffsBlueprint.NaturesWand]: itemNaturesWand,
  [StaffsBlueprint.SolarStaff]: itemSolarStaff,
  [StaffsBlueprint.DoomStaff]: itemDoomStaff,
  [StaffsBlueprint.GravityStaff]: itemGravityStaff,
  [StaffsBlueprint.LunarWand]: itemLunarWand,
  [StaffsBlueprint.ElementalStaff]: itemElementalStaff,
  [StaffsBlueprint.SerpentWand]: itemSerpentWand,
  [StaffsBlueprint.EagleEyeWand]: itemEagleEyeWand,
  [StaffsBlueprint.FrostbiteWand]: itemFrostbiteWand,
  [StaffsBlueprint.ElysianEyeStaff]: itemElysianEyeStaff,
  [StaffsBlueprint.AshwoodStaff]: itemAshwoodstaff,

  [StaffsBlueprint.SparklingStaff]: itemSparklingStaff,
  [StaffsBlueprint.OracleStaff]: itemOracleStaff,
  [StaffsBlueprint.RainbowWand]: itemRainbowWand,
  [StaffsBlueprint.ThunderBoltStaff]: itemThunderBoltStaff,
  [StaffsBlueprint.ProphecyStaff]: itemProphecyStaff,
  [StaffsBlueprint.LightningWand]: itemLightningWand,
  [StaffsBlueprint.StormStaff]: itemStormStaff,
  [StaffsBlueprint.StormyWand]: itemStormyWand,
  [StaffsBlueprint.DarkMoonStaff]: itemDarkMoonStaff,
  [StaffsBlueprint.FlameSecretWand]: itemFlameSecretWand,
  [StaffsBlueprint.GhostFireStaff]: itemGhostFireStaff,
  [StaffsBlueprint.DoomsdayStaff]: itemDoomsdayStaff,
  [StaffsBlueprint.FireHeartStaff]: itemFireHeartStaff,
  [StaffsBlueprint.ShadowLordWand]: itemShadowLordWand,
  [StaffsBlueprint.MysticLightningStaff]: itemMysticLightningStaff,
};
