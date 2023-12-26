import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import {
  CraftingResourcesBlueprint,
  MagicsBlueprint,
  ShieldsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeEmeraldShield: IUseWithCraftingRecipe = {
  outputKey: ShieldsBlueprint.EmeraldShield,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Eye,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 25,
    },
    {
      key: MagicsBlueprint.DarkRune,
      qty: 100,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.Jade, 100],
      [CraftingResourcesBlueprint.Diamond, 100],
      [CraftingResourcesBlueprint.Eye, 20],
      [CraftingResourcesBlueprint.DragonTooth, 100],
      [CraftingResourcesBlueprint.WoodenBoard, 25],
      [MagicsBlueprint.DarkRune, 100],
    ]),
  ],
};
