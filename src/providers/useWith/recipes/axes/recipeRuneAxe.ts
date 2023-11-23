import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import {
  AxesBlueprint,
  CraftingResourcesBlueprint,
  MagicsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeRuneAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.RuneAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 4,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 5,
    },
    {
      key: MagicsBlueprint.DarkRune,
      qty: 1,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.SteelIngot, 4],
      [CraftingResourcesBlueprint.WoodenBoard, 5],
      [CraftingResourcesBlueprint.MagicRecipe, 1],
    ]),
  ],
};
