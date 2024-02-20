import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, HelmetsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeDeathsHelmet: IUseWithCraftingRecipe = {
  outputKey: HelmetsBlueprint.DeathsHelmet,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 8,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 4,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.IronIngot, 8],
      [CraftingResourcesBlueprint.ObsidiumIngot, 2],
      [CraftingResourcesBlueprint.CorruptionIngot, 4],
    ]),
  ],
};
