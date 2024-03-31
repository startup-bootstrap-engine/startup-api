import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeGoldenArrow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.GoldenArrow,
  outputQtyRange: [2, 7],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Feather,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 25,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Lumberjacking,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.Feather, 10],
      [CraftingResourcesBlueprint.ElvenWood, 10],
      [CraftingResourcesBlueprint.WoodenBoard, 10],
      [CraftingResourcesBlueprint.GoldenIngot, 25],
    ]),
  ],
};
