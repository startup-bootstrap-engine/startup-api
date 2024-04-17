import { LegsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeBloodfireLegs } from "./tier4/recipeBloodfireLegs";
import { recipeBlueLegs } from "./tier7/recipeBlueLegs";
import { recipeDragonScaleLegs } from "./tier13/recipeDragonScaleLegs";
import { recipeDwarvenLegs } from "./tier11/recipeDwarvenLegs";
import { recipeFalconLegs } from "./tier3/recipeFalconLegs";
import { recipeHoneyGlowLegs } from "./tier9/recipeHoneyGlowLegs";
import { recipeIvoryMoonLegs } from "./tier11/recipeIvoryMoonLegs";
import { recipeLeatherLegs } from "./tier0/recipeLeatherLegs";
import { recipeRustedIronLegs } from "./tier6/recipeRustedIronLegs";
import { recipeSilvershadeLegs } from "./tier8/recipeSilvershadeLegs";
import { recipeSolarflareLegs } from "./tier12/recipeSolarflareLegs";
import { recipeStuddedLegs } from "./tier1/recipeStuddedLegs";
import { recipeTempestLegs } from "./tier10/recipeTempestLegs";

export const recipeLegsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [LegsBlueprint.StuddedLegs]: [recipeStuddedLegs],
  [LegsBlueprint.BloodfireLegs]: [recipeBloodfireLegs],
  [LegsBlueprint.FalconsLegs]: [recipeFalconLegs],
  [LegsBlueprint.LeatherLegs]: [recipeLeatherLegs],
  [LegsBlueprint.BlueLegs]: [recipeBlueLegs],
  [LegsBlueprint.DwarvenLegs]: [recipeDwarvenLegs],
  [LegsBlueprint.HoneyGlowLegs]: [recipeHoneyGlowLegs],
  [LegsBlueprint.IvoryMoonLegs]: [recipeIvoryMoonLegs],
  [LegsBlueprint.RustedIronLegs]: [recipeRustedIronLegs],
  [LegsBlueprint.SilvershadeLegs]: [recipeSilvershadeLegs],
  [LegsBlueprint.SolarflareLegs]: [recipeSolarflareLegs],
  [LegsBlueprint.TempestLegs]: [recipeTempestLegs],
  [LegsBlueprint.DragonScaleLegs]: [recipeDragonScaleLegs],
};
