import { CraftingResourcesBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeWoodBreakerAxe: IUseWithCraftingRecipe = {
  outputKey: ToolsBlueprint.WoodBreakerAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SmallWoodenStick,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumOre,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 18],
};
