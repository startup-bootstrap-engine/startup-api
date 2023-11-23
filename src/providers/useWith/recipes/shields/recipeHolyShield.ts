import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import {
  CraftingResourcesBlueprint,
  MagicsBlueprint,
  ShieldsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeHolyShield: IUseWithCraftingRecipe = {
  outputKey: ShieldsBlueprint.HolyShield,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 5,
    },
    {
      key: MagicsBlueprint.HealRune,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 2,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.GoldenIngot, 20],
      [CraftingResourcesBlueprint.PhoenixFeather, 10],
      [CraftingResourcesBlueprint.ColoredFeather, 10],
      [CraftingResourcesBlueprint.WoodenBoard, 5],
      [CraftingResourcesBlueprint.MagicRecipe, 5],
      [CraftingResourcesBlueprint.DragonTooth, 2],
    ]),
  ],
};
