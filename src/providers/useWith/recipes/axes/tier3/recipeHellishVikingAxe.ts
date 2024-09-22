import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeHellishVikingAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.HellishVikingAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.Eye,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.BatsWing,
      qty: 15,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.SteelIngot, 20],
      [CraftingResourcesBlueprint.Eye, 8],
      [CraftingResourcesBlueprint.BatsWing, 8],
    ]),
  ],
};
