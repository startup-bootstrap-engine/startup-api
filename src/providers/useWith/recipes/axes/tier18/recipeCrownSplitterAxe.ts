import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeCrownSplitterAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.CrownSplitterAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 100,
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
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 66],
};
