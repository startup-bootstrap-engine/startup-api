import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeElementalStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.ElementalStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.Eye,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 38],
};
