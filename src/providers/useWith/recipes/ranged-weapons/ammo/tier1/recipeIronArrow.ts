import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeIronArrow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.IronArrow,
  outputQtyRange: [2, 5],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Feather,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 1,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Lumberjacking,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.Feather, 2],
      [CraftingResourcesBlueprint.WoodenBoard, 2],
      [CraftingResourcesBlueprint.IronIngot, 1],
    ]),
  ],
};
