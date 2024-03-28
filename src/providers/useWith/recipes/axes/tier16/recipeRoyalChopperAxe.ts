import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeRoyalChopperAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.RoyalChopperAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 50,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 62],
};
