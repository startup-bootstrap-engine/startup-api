import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeNightshadeBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.NightshadeBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.BatsWing,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 80,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 36],
};
