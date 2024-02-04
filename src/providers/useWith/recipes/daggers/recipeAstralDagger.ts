import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeAstralDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.AstralDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Bone,
      qty: 55,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 85,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WaterBottle,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.Bone, 55],
      [CraftingResourcesBlueprint.Skull, 85],
      [CraftingResourcesBlueprint.SteelIngot, 60],
      [CraftingResourcesBlueprint.WaterBottle, 10],
    ]),
  ],
};
