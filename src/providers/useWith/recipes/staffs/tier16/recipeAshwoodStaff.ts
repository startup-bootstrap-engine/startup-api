import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeAshwoodStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.AshwoodStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 12,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 12,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 14,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 8,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 8,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 54],
};
