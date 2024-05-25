import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeBloodmoonCleaver: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.BloodmoonCleaver,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.SilverOre,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 120,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 55],
};
