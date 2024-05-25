import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeSeraphicAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.SeraphicAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.CopperOre,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 75,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 64],
};
