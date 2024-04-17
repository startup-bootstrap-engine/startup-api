import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeDanishAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.DanishAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 79,
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
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 120,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 48],
};
