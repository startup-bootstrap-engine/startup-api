import { CraftingResourcesBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeElderHeartAxe: IUseWithCraftingRecipe = {
  outputKey: ToolsBlueprint.ElderHeartAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 50,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 20],
};
