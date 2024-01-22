import { MacesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeBloodstainedCenser } from "./recipeBloodstainedCenser";
import { recipeBronzeFistMace } from "./recipeBronzeFistMace";
import { recipeHellishMace } from "./recipeHellishMace";
import { recipeMace } from "./recipeMace";
import { recipeRusticFlail } from "./recipeRusticFlail";
import { recipeSilverBulbMace } from "./recipeSilverBulbMace";
import { recipeSilverFistMace } from "./recipeSilverFistMace";
import { recipeSpectralMace } from "./recipeSpectralMace";
import { recipeSpikedClub } from "./recipeSpikedClub";
import { recipeWoodenMace } from "./recipeWoodenMace";
import { recipeBoneBreakerClub } from "./recipeBoneBreakerClub";
import { recipeIronWoodCrusherClub } from "./recipeIronwoodCrusherClub";
import { recipeMetalMasherClub } from "./recipeMetalMasherClub";
import { recipeStarfirMaulClub } from "./recipeStarfirMaulClub";
import { recipeStonefangCleaverClub } from "./recipeStoneFangCleaverClub";

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
