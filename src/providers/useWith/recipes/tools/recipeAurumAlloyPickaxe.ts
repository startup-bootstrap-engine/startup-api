import { CraftingResourcesBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeAurumAlloyPickaxe: IUseWithCraftingRecipe = {
  outputKey: ToolsBlueprint.AurumAlloyPickaxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 8,
    },
    {
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Mining, 26],
};
