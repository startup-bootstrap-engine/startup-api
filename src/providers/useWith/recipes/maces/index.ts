import { MacesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeBloodstainedCenser } from "./tier4/recipeBloodstainedCenser";
import { recipeBronzeFistMace } from "./tier6/recipeBronzeFistMace";
import { recipeHellishMace } from "./tier4/recipeHellishMace";
import { recipeMace } from "./tier1/recipeMace";
import { recipeRusticFlail } from "./tier3/recipeRusticFlail";
import { recipeSilverBulbMace } from "./tier3/recipeSilverBulbMace";
import { recipeSilverFistMace } from "./tier7/recipeSilverFistMace";
import { recipeSpectralMace } from "./tier5/recipeSpectralMace";
import { recipeSpikedClub } from "./tier1/recipeSpikedClub";
import { recipeWoodenMace } from "./tier0/recipeWoodenMace";
import { recipeBoneBreakerClub } from "./tier7/recipeBoneBreakerClub";
import { recipeIronWoodCrusherClub } from "./tier7/recipeIronwoodCrusherClub";
import { recipeMetalMasherClub } from "./tier7/recipeMetalMasherClub";
import { recipeStarfirMaulClub } from "./tier9/recipeStarfirMaulClub";
import { recipeStonefangCleaverClub } from "./tier8/recipeStoneFangCleaverClub";

export const recipeMacesIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [MacesBlueprint.SpikedClub]: [recipeSpikedClub],
  [MacesBlueprint.Mace]: [recipeMace],
  [MacesBlueprint.BloodstainedCenser]: [recipeBloodstainedCenser],
  [MacesBlueprint.RusticFlail]: [recipeRusticFlail],
  [MacesBlueprint.SilverBulbMace]: [recipeSilverBulbMace],
  [MacesBlueprint.WoodenMace]: [recipeWoodenMace],
  [MacesBlueprint.HellishMace]: [recipeHellishMace],
  [MacesBlueprint.BronzeFistMace]: [recipeBronzeFistMace],
  [MacesBlueprint.SilverFistMace]: [recipeSilverFistMace],
  [MacesBlueprint.SpectralMace]: [recipeSpectralMace],
  [MacesBlueprint.BoneBreakerClub]: [recipeBoneBreakerClub],
  [MacesBlueprint.IronWoodCrusherClub]: [recipeIronWoodCrusherClub],
  [MacesBlueprint.MetalMasherClub]: [recipeMetalMasherClub],
  [MacesBlueprint.StarfirMaulClub]: [recipeStarfirMaulClub],
  [MacesBlueprint.StonefangCleaverClub]: [recipeStonefangCleaverClub],
};
