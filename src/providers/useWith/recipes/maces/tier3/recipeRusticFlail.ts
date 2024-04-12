import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, MacesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeRusticFlail: IUseWithCraftingRecipe = {
  outputKey: MacesBlueprint.RusticFlail,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Leather,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.BatsWing,
      qty: 2,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.WoodenBoard, 10],
      [CraftingResourcesBlueprint.Leather, 5],
      [CraftingResourcesBlueprint.BatsWing, 2],
    ]),
  ],
};
