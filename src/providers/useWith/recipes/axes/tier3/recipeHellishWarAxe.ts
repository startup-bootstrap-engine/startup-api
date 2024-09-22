import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeHellishWarAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.HellishWarAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 8,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.SilverIngot, 20],
      [CraftingResourcesBlueprint.RedSapphire, 6],
      [CraftingResourcesBlueprint.WoodenSticks, 10],
    ]),
  ],
};
