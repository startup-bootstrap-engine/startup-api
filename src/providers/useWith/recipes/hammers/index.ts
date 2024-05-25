import { HammersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipePhoenixFireHammer } from "./tier14/recipePhoenixFireHammer";
import { recipeShadowHammer } from "./tier14/recipeShadowHammer";
import { recipeFrostSteelHammer } from "./tier15/recipeFrostSteelHammer";
import { recipeThunderForgedHammer } from "./tier15/recipeThunderForgedHammer";
import { recipeSledgeHammer } from "./tier7/recipeSledgeHammer";
import { recipeMedievalCrossedHammer } from "./tier9/recipeMedievalCrossedHammer";

export const recipeHammersIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [HammersBlueprint.MedievalCrossedHammer]: [recipeMedievalCrossedHammer],
  [HammersBlueprint.SledgeHammer]: [recipeSledgeHammer],

  [HammersBlueprint.PhoenixFireHammer]: [recipePhoenixFireHammer],
  [HammersBlueprint.ShadowHammer]: [recipeShadowHammer],
  [HammersBlueprint.FrostSteelHammer]: [recipeFrostSteelHammer],
  [HammersBlueprint.ThunderForgedHammer]: [recipeThunderForgedHammer],
};
