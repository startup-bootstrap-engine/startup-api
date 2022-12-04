import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "../../useWithTypes";

export const recipeIceSword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.IceSword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 5,
    },
  ],
  successChance: 25,
};