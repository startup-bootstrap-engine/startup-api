import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeStarshardDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.StarshardDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Bone,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 85,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 15,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.Bone, 60],
      [CraftingResourcesBlueprint.Skull, 85],
      [CraftingResourcesBlueprint.SilverIngot, 60],
      [CraftingResourcesBlueprint.CopperIngot, 15],
    ]),
  ],
};
