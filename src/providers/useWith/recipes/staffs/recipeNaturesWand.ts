import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../useWithTypes";

export const recipeNaturesWand: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.NaturesWand,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 112,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 20,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Alchemy,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.ElvenWood, 110],
      [CraftingResourcesBlueprint.WoodenBoard, 112],
      [CraftingResourcesBlueprint.MagicRecipe, 20],
    ]),
  ],
};