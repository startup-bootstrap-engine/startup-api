import { StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeCorruptionStaff } from "./tier2/recipeCorruptionStaff";
import { recipeDoomStaff } from "./tier16/recipeDoomStaff";
import { recipeElysianEyeStaff } from "./tier16/recipeElysianEyeStaff";
import { recipeEnchantedStaff } from "./tier4/recipeEnchantedStaff";
import { recipeFireStaff } from "./tier3/recipeFireStaff";
import { recipeFireWand } from "./tier1/recipeFireWand";
import { recipeFireburstWand } from "./tier10/recipeFireburstWand";
import { recipeGaleforceStaff } from "./tier15/recipeGaleforceStaff";
import { recipeHellishBronzeStaff } from "./tier14/recipeHellishBronzeStaff";
import { recipeLunarWand } from "./tier13/recipeLunarWand";
import { recipeNaturesWand } from "./tier8/recipeNaturesWand";
import { recipePoisonWand } from "./tier1/recipePoisonWand";
import { recipeRoyalStaff } from "./tier5/recipeRoyalStaff";
import { recipeRubyStaff } from "./tier4/recipeRubyStaff";
import { recipeSangriaStaff } from "./tier5/recipeSangriaStaff";
import { recipeBlueSkyStaff } from "./tier4/recipeSkyBlueStaff";
import { recipeSolarStaff } from "./tier11/recipeSolarStaff";
import { recipeSpellbinderWand } from "./tier7/recipeSpellbinderWand";
import { recipeTartarusStaff } from "./tier5/recipeTartarusStaff";
import { recipeVortexStaff } from "./tier12/recipeVortexStaff";
import { recipeWinterspireStaff } from "./tier10/recipeWinterspireStaff";
import { recipeWoodenStaff } from "./tier0/recipeWoodenStaff";
import { recipeAshwoodStaff } from "./tier16/recipeAshwoodStaff";
import { recipeGravityStaff } from "./tier15/recipeGravityStaff";
import { recipeElementalStaff } from "./tier14/recipeElementalStaff";

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
};
