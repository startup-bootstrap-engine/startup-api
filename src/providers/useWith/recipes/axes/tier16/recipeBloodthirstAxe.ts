import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeBloodthirstAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.BloodthirstAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.IronOre,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 60],
};
