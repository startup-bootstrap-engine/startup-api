import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeInfernalCleaver: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.InfernalCleaver,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 7505,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 35,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 120,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 49],
};
