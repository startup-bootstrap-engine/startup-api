import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeNightshadeAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.NightshadeAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumOre,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.Feather,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 56],
};
