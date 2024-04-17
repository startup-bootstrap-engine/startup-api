import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeMaulAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.MaulAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 55,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 55,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 50],
};
