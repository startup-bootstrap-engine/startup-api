import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../useWithTypes";

export const recipeBread: IUseWithCraftingRecipe = {
  outputKey: FoodsBlueprint.Bread,
  outputQtyRange: [1, 2],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Wheat,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.WaterBottle,
      qty: 1,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Cooking,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.Wheat, 1],
      [CraftingResourcesBlueprint.WaterBottle, 1],
    ]),
  ],
};
