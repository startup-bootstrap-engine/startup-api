import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeIceShardLongsword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.IceShardLongsword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 6,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 3,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.WoodenBoard, 10],
      [CraftingResourcesBlueprint.BlueSapphire, 6],
      [CraftingResourcesBlueprint.SteelIngot, 3],
    ]),
  ],
};
