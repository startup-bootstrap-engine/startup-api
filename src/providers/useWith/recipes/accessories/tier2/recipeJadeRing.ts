import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeJadeRing: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.JadeRing,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 1,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.IronIngot, 2],
      [CraftingResourcesBlueprint.Jade, 1],
      [CraftingResourcesBlueprint.BlueSilk, 2],
      [CraftingResourcesBlueprint.Diamond, 1],
    ]),
  ],
};
