import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeGaleforceStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.GaleforceStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 160,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 39],
};
