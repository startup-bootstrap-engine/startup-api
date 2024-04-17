import { CraftingResourcesBlueprint, MacesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeStonefangCleaverClub: IUseWithCraftingRecipe = {
  outputKey: MacesBlueprint.StonefangCleaverClub,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.BatsWing,
      qty: 6,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 35],
};
