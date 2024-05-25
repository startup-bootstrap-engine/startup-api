import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeFireHeartStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.FireHeartStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 35,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 39],
};
