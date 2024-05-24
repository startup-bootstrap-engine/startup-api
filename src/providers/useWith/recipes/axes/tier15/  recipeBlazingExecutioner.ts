import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeBlazingExecutioner: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.BlazingExecutioner,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 56],
};
