import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeYetiHalberd: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.YetiHalberd,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.IronIngot, 10],
      [CraftingResourcesBlueprint.ElvenWood, 8],
      [CraftingResourcesBlueprint.WoodenSticks, 8],
      [CraftingResourcesBlueprint.SilverIngot, 10],
    ]),
  ],
};
