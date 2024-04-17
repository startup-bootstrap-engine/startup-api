import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeWoodenBoard: IUseWithCraftingRecipe = {
  outputKey: CraftingResourcesBlueprint.WoodenBoard,
  outputQtyRange: [1, 3],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreaterWoodenLog,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.SmallWoodenStick,
      qty: 5,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Lumberjacking,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.GreaterWoodenLog, 3],
      [CraftingResourcesBlueprint.WoodenSticks, 5],
      [CraftingResourcesBlueprint.SmallWoodenStick, 5],
    ]),
  ],
};
