import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, SpearsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeMushroomSpear: IUseWithCraftingRecipe = {
  outputKey: SpearsBlueprint.MushroomSpear,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 15,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Lumberjacking,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.GreenIngot, 20],
      [CraftingResourcesBlueprint.SteelIngot, 20],
      [CraftingResourcesBlueprint.WoodenBoard, 15],
    ]),
  ],
};
