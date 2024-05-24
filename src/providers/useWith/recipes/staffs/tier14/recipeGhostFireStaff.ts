import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeGhostFireStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.GhostFireStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BatsWing,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 50,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 37],
};
