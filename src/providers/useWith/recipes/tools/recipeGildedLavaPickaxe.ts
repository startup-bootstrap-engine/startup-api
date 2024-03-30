import { CraftingResourcesBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeGildedLavaPickaxe: IUseWithCraftingRecipe = {
  outputKey: ToolsBlueprint.GildedLavaPickaxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 90,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Mining, 36],
};
