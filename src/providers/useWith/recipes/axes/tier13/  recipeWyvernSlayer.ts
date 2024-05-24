import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeWyvernSlayer: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.WyvernSlayer,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 120,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 48],
};
