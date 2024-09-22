import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeGoldenRing: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.GoldenRing,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 4,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 1,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.GoldenIngot, 3],
      [CraftingResourcesBlueprint.GoldenOre, 3],
      [CraftingResourcesBlueprint.Silk, 2],
      [CraftingResourcesBlueprint.WolfTooth, 1],
    ]),
  ],
};
