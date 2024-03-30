import { CraftingResourcesBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeEmeraldEclipsesPickaxe: IUseWithCraftingRecipe = {
  outputKey: ToolsBlueprint.EmeraldEclipsesPickaxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 80,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Mining, 32],
};
