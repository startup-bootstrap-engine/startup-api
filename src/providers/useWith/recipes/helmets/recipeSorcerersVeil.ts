import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, HelmetsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeSorcerersVeil: IUseWithCraftingRecipe = {
  outputKey: HelmetsBlueprint.SorcerersVeil,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 7,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.CopperIngot, 7],
      [CraftingResourcesBlueprint.CorruptionIngot, 10],
      [CraftingResourcesBlueprint.GoldenIngot, 10],
    ]),
  ],
};
