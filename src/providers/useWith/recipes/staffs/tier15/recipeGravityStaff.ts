import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeGravityStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.GravityStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 160,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 39],
};
