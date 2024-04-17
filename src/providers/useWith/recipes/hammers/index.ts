import { HammersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeMedievalCrossedHammer } from "./tier9/recipeMedievalCrossedHammer";
import { recipeSledgeHammer } from "./tier7/recipeSledgeHammer";

export const recipeHammersIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [HammersBlueprint.MedievalCrossedHammer]: [recipeMedievalCrossedHammer],
  [HammersBlueprint.SledgeHammer]: [recipeSledgeHammer],
};
