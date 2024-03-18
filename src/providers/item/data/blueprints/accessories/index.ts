import { AccessoriesBlueprint } from "../../types/itemsBlueprintTypes";
import { itemSilverKey } from "./itemSilverKey";
import { itemAmazonsNecklace } from "./tier0/ItemAmazonsNecklace";
import { itemAmuletOfDeath } from "./tier0/ItemAmuletOfDeath";
import { itemAmuletOfLuck } from "./tier0/ItemAmuletOfLuck";
import { itemBandana } from "./tier0/ItemBandana";
import { itemCorruptionNecklace } from "./tier0/ItemCorruptionNecklace";
import { itemDeathNecklace } from "./tier0/ItemDeathNecklace";
import { itemElvenRing } from "./tier0/ItemElvenRing";
import { itemPendantOfLife } from "./tier0/ItemPendantOfLife";
import { itemPendantOfMana } from "./tier0/ItemPendantOfMana";
import { itemRoyalBracelet } from "./tier0/ItemRoyalBracelet";
import { itemSapphireNecklace } from "./tier0/ItemSapphireNecklace";
import { itemStarNecklace } from "./tier0/ItemStarNecklace";
import { itemWolfToothChain } from "./tier0/ItemWolfToothChain";
import { itemFalconsRing } from "./tier1/ItemFalconsRing";
import { itemGlacialRing } from "./tier1/ItemGlacialRing";
import { itemHasteRing } from "./tier1/ItemHasteRing";
import { itemIronRing } from "./tier1/ItemIronRing";
import { itemOrcRing } from "./tier1/ItemOrcRing";
import { itemSoldiersRing } from "./tier1/ItemSoldiersRing";
import { itemBloodstoneAmulet } from "./tier13/ItemBloodstoneAmulet";
import { itemForestHeartPendant } from "./tier15/ItemForestHeartPendant";
import { itemEmeraldEleganceNecklace } from "./tier17/ItemEmeraldEleganceNecklace";
import { itemEarthstoneEmeraldNecklace } from "./tier18/itemEarthstoneEmeraldNecklace";
import { itemRubyNeckles } from "./tier18/itemRubyNeckles";
import { itemSapphireStrandNecklace } from "./tier18/itemSapphireStrandNecklace";
import { itemGoldenRubyNecklace } from "./tier19/itemGoldenRubyNecklace";
import { itemSunlitRubyNecklace } from "./tier19/itemSunlitRubyNecklace";
import { itemGoldenRing } from "./tier2/ItemGoldenRing";
import { itemJadeRing } from "./tier2/ItemJadeRing";
import { itemRubyRing } from "./tier2/ItemRubyRing";
import { itemSapphireRing } from "./tier2/ItemSapphireRing";
import { itemRubyglintNecklace } from "./tier20/itemRubyglintNecklace";
import { itemWoodlandNecklace } from "./tier20/itemWoodlandNecklace";
import { itemEmberStrandNecklace } from "./tier21/itemEmberStrandNecklace";
import { itemGarnetNecklace } from "./tier21/itemGarnetNecklace";
import { itemEmberglowNecklace } from "./tier22/itemEmberglowNecklace";
import { itemGildedNecklace } from "./tier22/itemGildedNecklace";
import { itemAzureNecklace } from "./tier23/itemAzureNecklace";
import { itemTwilightEmberNecklace } from "./tier23/itemTwilightEmberNecklace";
import { itemCrimsonNecklace } from "./tier24/itemCrimsonNecklace";
import { itemScarletNecklace } from "./tier24/itemScarletNecklace";
import { itemSilverRing } from "./tier25/itemSilverRing";
import { itemWoodenRing } from "./tier25/itemWoodenRing";
import { itemQuantumSunRing } from "./tier26/itemQuantumSunRing";
import { itemSmokeRing } from "./tier26/itemSmokeRing";
import { itemGreenTourmalineRing } from "./tier27/itemGreenTourmalineRing";
import { itemSilverDawnRing } from "./tier27/itemSilverDawnRing";
import { itemGoldenGlimmerRing } from "./tier28/itemGoldenGlimmerRing";
import { itemMoonstoneRing } from "./tier28/itemMoonstoneRing";
import { itemCherryRing } from "./tier29/itemCherryRing";
import { itemEmeraldRing } from "./tier29/itemEmeraldRing";
import { itemRubyTriquetraRing } from "./tier30/itemRubyTriquetraRing";
import { itemSapphireSerenadeRing } from "./tier30/itemSapphireSerenadeRing";
import { itemFrostfireRubyRing } from "./tier31/itemFrostfireRubyRing";
import { itemGoldenGlowRing } from "./tier31/itemGoldenGlowRing";

export const accessoriesBlueprintIndex = {
  [AccessoriesBlueprint.SilverKey]: itemSilverKey,
  [AccessoriesBlueprint.CorruptionNecklace]: itemCorruptionNecklace,
  [AccessoriesBlueprint.DeathNecklace]: itemDeathNecklace,
  [AccessoriesBlueprint.Bandana]: itemBandana,
  [AccessoriesBlueprint.ElvenRing]: itemElvenRing,
  [AccessoriesBlueprint.GoldenRing]: itemGoldenRing,
  [AccessoriesBlueprint.HasteRing]: itemHasteRing,
  [AccessoriesBlueprint.IronRing]: itemIronRing,
  [AccessoriesBlueprint.JadeRing]: itemJadeRing,
  [AccessoriesBlueprint.OrcRing]: itemOrcRing,
  [AccessoriesBlueprint.RubyRing]: itemRubyRing,
  [AccessoriesBlueprint.SapphireRing]: itemSapphireRing,
  [AccessoriesBlueprint.SoldiersRing]: itemSoldiersRing,
  [AccessoriesBlueprint.AmazonsNecklace]: itemAmazonsNecklace,
  [AccessoriesBlueprint.RoyalBracelet]: itemRoyalBracelet,
  [AccessoriesBlueprint.SapphireNecklace]: itemSapphireNecklace,
  [AccessoriesBlueprint.StarNecklace]: itemStarNecklace,
  [AccessoriesBlueprint.WolfToothChain]: itemWolfToothChain,
  [AccessoriesBlueprint.AmuletOfDeath]: itemAmuletOfDeath,
  [AccessoriesBlueprint.AmuletOfLuck]: itemAmuletOfLuck,
  [AccessoriesBlueprint.PendantOfLife]: itemPendantOfLife,
  [AccessoriesBlueprint.PendantOfMana]: itemPendantOfMana,
  [AccessoriesBlueprint.FalconsRing]: itemFalconsRing,
  [AccessoriesBlueprint.GlacialRing]: itemGlacialRing,
  [AccessoriesBlueprint.BloodstoneAmulet]: itemBloodstoneAmulet,
  [AccessoriesBlueprint.ForestHeartPendant]: itemForestHeartPendant,
  [AccessoriesBlueprint.EmeraldEleganceNecklace]: itemEmeraldEleganceNecklace,
  [AccessoriesBlueprint.EarthstoneEmeraldNecklace]: itemEarthstoneEmeraldNecklace,
  [AccessoriesBlueprint.RubyNeckles]: itemRubyNeckles,
  [AccessoriesBlueprint.SapphireStrandNecklace]: itemSapphireStrandNecklace,
  [AccessoriesBlueprint.GoldenRubyNecklace]: itemGoldenRubyNecklace,
  [AccessoriesBlueprint.SunlitRubyNecklace]: itemSunlitRubyNecklace,
  [AccessoriesBlueprint.RubyglintNecklace]: itemRubyglintNecklace,
  [AccessoriesBlueprint.WoodlandNecklace]: itemWoodlandNecklace,
  [AccessoriesBlueprint.EmberStrandNecklace]: itemEmberStrandNecklace,
  [AccessoriesBlueprint.GarnetNecklace]: itemGarnetNecklace,
  [AccessoriesBlueprint.EmberglowNecklace]: itemEmberglowNecklace,
  [AccessoriesBlueprint.GildedNecklace]: itemGildedNecklace,
  [AccessoriesBlueprint.AzureNecklace]: itemAzureNecklace,
  [AccessoriesBlueprint.TwilightEmberNecklace]: itemTwilightEmberNecklace,
  [AccessoriesBlueprint.CrimsonNecklace]: itemCrimsonNecklace,
  [AccessoriesBlueprint.ScarletNecklace]: itemScarletNecklace,
  [AccessoriesBlueprint.SilverRing]: itemSilverRing,
  [AccessoriesBlueprint.WoodenRing]: itemWoodenRing,
  [AccessoriesBlueprint.QuantumSunRing]: itemQuantumSunRing,
  [AccessoriesBlueprint.SmokeRing]: itemSmokeRing,
  [AccessoriesBlueprint.GreenTourmalineRing]: itemGreenTourmalineRing,
  [AccessoriesBlueprint.SilverDawnRing]: itemSilverDawnRing,
  [AccessoriesBlueprint.GoldenGlimmerRing]: itemGoldenGlimmerRing,
  [AccessoriesBlueprint.MoonstoneRing]: itemMoonstoneRing,
  [AccessoriesBlueprint.CherryRing]: itemCherryRing,
  [AccessoriesBlueprint.EmeraldRing]: itemEmeraldRing,
  [AccessoriesBlueprint.RubyTriquetraRing]: itemRubyTriquetraRing,
  [AccessoriesBlueprint.SapphireSerenadeRing]: itemSapphireSerenadeRing,
  [AccessoriesBlueprint.FrostfireRubyRing]: itemFrostfireRubyRing,
  [AccessoriesBlueprint.GoldenGlowRing]: itemGoldenGlowRing,
};
