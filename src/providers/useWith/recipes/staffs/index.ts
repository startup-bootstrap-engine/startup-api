import { StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeWoodenStaff } from "./tier0/recipeWoodenStaff";
import { recipeFireWand } from "./tier1/recipeFireWand";
import { recipePoisonWand } from "./tier1/recipePoisonWand";
import { recipeFireburstWand } from "./tier10/recipeFireburstWand";
import { recipeWinterspireStaff } from "./tier10/recipeWinterspireStaff";
import { recipeSolarStaff } from "./tier11/recipeSolarStaff";
import { recipeVortexStaff } from "./tier12/recipeVortexStaff";
import { recipeLunarWand } from "./tier13/recipeLunarWand";
import { recipeElementalStaff } from "./tier14/recipeElementalStaff";
import { recipeGhostFireStaff } from "./tier14/recipeGhostFireStaff";
import { recipeHellishBronzeStaff } from "./tier14/recipeHellishBronzeStaff";
import { recipeDoomsdayStaff } from "./tier15/recipeDoomsdayStaff";
import { recipeGaleforceStaff } from "./tier15/recipeGaleforceStaff";
import { recipeGravityStaff } from "./tier15/recipeGravityStaff";
import { recipeAshwoodStaff } from "./tier16/recipeAshwoodStaff";
import { recipeDoomStaff } from "./tier16/recipeDoomStaff";
import { recipeElysianEyeStaff } from "./tier16/recipeElysianEyeStaff";
import { recipeMysticLightningStaff } from "./tier16/recipeMysticLightningStaff";
import { recipeShadowLordWand } from "./tier16/recipeShadowLordWand";
import { recipeCorruptionStaff } from "./tier2/recipeCorruptionStaff";
import { recipeFireStaff } from "./tier3/recipeFireStaff";
import { recipeEnchantedStaff } from "./tier4/recipeEnchantedStaff";
import { recipeRubyStaff } from "./tier4/recipeRubyStaff";
import { recipeBlueSkyStaff } from "./tier4/recipeSkyBlueStaff";
import { recipeRoyalStaff } from "./tier5/recipeRoyalStaff";
import { recipeSangriaStaff } from "./tier5/recipeSangriaStaff";
import { recipeTartarusStaff } from "./tier5/recipeTartarusStaff";
import { recipeSpellbinderWand } from "./tier7/recipeSpellbinderWand";
import { recipeNaturesWand } from "./tier8/recipeNaturesWand";
import { recipeAppendicesStaff } from "./tier1/recipeAppendicesStaff";
import { recipeRainbowWand } from "./tier10/recipeRainbowWand";
import { recipeLightningWand } from "./tier12/recipeLightningWand";

export const recipeStaffsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [StaffsBlueprint.FireStaff]: [recipeFireStaff],
  [StaffsBlueprint.CorruptionStaff]: [recipeCorruptionStaff],
  [StaffsBlueprint.EnchantedStaff]: [recipeEnchantedStaff],
  [StaffsBlueprint.RubyStaff]: [recipeRubyStaff],
  [StaffsBlueprint.SkyBlueStaff]: [recipeBlueSkyStaff],
  [StaffsBlueprint.RoyalStaff]: [recipeRoyalStaff],
  [StaffsBlueprint.SangriaStaff]: [recipeSangriaStaff],
  [StaffsBlueprint.TartarusStaff]: [recipeTartarusStaff],
  [StaffsBlueprint.WoodenStaff]: [recipeWoodenStaff],
  [StaffsBlueprint.FireWand]: [recipeFireWand],
  [StaffsBlueprint.PoisonWand]: [recipePoisonWand],
  [StaffsBlueprint.DoomStaff]: [recipeDoomStaff],
  [StaffsBlueprint.FireburstWand]: [recipeFireburstWand],
  [StaffsBlueprint.GaleforceStaff]: [recipeGaleforceStaff],
  [StaffsBlueprint.HellishBronzeStaff]: [recipeHellishBronzeStaff],
  [StaffsBlueprint.LunarWand]: [recipeLunarWand],
  [StaffsBlueprint.NaturesWand]: [recipeNaturesWand],
  [StaffsBlueprint.SolarStaff]: [recipeSolarStaff],
  [StaffsBlueprint.SpellbinderWand]: [recipeSpellbinderWand],
  [StaffsBlueprint.VortexStaff]: [recipeVortexStaff],
  [StaffsBlueprint.WinterspireStaff]: [recipeWinterspireStaff],
  [StaffsBlueprint.ElysianEyeStaff]: [recipeElysianEyeStaff],
  [StaffsBlueprint.AshwoodStaff]: [recipeAshwoodStaff],
  [StaffsBlueprint.GravityStaff]: [recipeGravityStaff],
  [StaffsBlueprint.ElementalStaff]: [recipeElementalStaff],
  [StaffsBlueprint.GhostFireStaff]: [recipeGhostFireStaff],
  [StaffsBlueprint.DoomsdayStaff]: [recipeDoomsdayStaff],
  [StaffsBlueprint.MysticLightningStaff]: [recipeMysticLightningStaff],
  [StaffsBlueprint.ShadowLordWand]: [recipeShadowLordWand],
  [StaffsBlueprint.LightningWand]: [recipeLightningWand],
  [StaffsBlueprint.RainbowWand]: [recipeRainbowWand],
  [StaffsBlueprint.AppendicesStaff]: [recipeAppendicesStaff],
};
