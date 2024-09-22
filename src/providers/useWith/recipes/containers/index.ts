import { ContainersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeBackpack } from "./recipeBackpack";
import { recipeBag } from "./recipeBag";
import { recipePouch } from "./recipePouch";

export const recipeContainers: Record<string, IUseWithCraftingRecipe[]> = {
  [ContainersBlueprint.Bag]: [recipeBag],
  [ContainersBlueprint.Backpack]: [recipeBackpack],
  [ContainersBlueprint.Pouch]: [recipePouch],
};
