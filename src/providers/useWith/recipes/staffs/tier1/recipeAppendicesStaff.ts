import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeAppendicesStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.AppendicesStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 5,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Alchemy,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.BlueSapphire, 5],
      [CraftingResourcesBlueprint.WoodenBoard, 4],
      [CraftingResourcesBlueprint.GreenIngot, 5],
    ]),
  ],
};
