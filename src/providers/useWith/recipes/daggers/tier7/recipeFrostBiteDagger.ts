import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeFrostBiteDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.FrostBiteDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.Bones,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 50,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.CopperIngot, 40],
      [CraftingResourcesBlueprint.Bones, 80],
      [CraftingResourcesBlueprint.SteelIngot, 50],
    ]),
  ],
};
