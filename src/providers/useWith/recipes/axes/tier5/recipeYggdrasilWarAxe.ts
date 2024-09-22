import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeYggdrasilWarAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.YggdrasilWarAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Bones,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.GoldenIngot, 10],
      [CraftingResourcesBlueprint.GreenIngot, 10],
      [CraftingResourcesBlueprint.Skull, 8],
      [CraftingResourcesBlueprint.Bones, 10],
    ]),
  ],
};
