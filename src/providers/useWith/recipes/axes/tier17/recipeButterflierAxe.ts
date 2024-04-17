import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeButterflierAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.ButterflierAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BatsWing,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.GreenOre,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 63],
};
