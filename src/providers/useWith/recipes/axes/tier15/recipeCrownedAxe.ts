import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeCrownedAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.CrownedAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 110,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 53],
};
