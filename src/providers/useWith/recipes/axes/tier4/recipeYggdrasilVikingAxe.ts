import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeYggdrasilVikingAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.YggdrasilVikingAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
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
      [CraftingResourcesBlueprint.CopperIngot, 12],
      [CraftingResourcesBlueprint.BlueSilk, 8],
      [CraftingResourcesBlueprint.ColoredFeather, 10],
      [CraftingResourcesBlueprint.WolfTooth, 10],
    ]),
  ],
};
