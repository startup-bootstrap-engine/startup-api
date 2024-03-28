import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeWoodenStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.WoodenStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 1],
};
