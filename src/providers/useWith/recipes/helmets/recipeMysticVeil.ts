import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, HelmetsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeMysticVeil: IUseWithCraftingRecipe = {
  outputKey: HelmetsBlueprint.MysticVeil,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.GoldenIngot, 5],
      [CraftingResourcesBlueprint.GreenIngot, 8],
      [CraftingResourcesBlueprint.WolfTooth, 10],
    ]),
  ],
};
