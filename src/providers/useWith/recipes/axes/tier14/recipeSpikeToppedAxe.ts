import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeSpikeToppedAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.SpikeToppedAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 52],
};
