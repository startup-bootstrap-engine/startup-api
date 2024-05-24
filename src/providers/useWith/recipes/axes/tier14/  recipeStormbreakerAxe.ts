import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeStormbreakerAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.StormbreakerAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 65,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 35,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 50,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 52],
};
