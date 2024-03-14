import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeYggdrasilBroadsword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.YggdrasilBroadsword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.Bones,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 20,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.ElvenWood, 30],
      [CraftingResourcesBlueprint.GoldenIngot, 20],
      [CraftingResourcesBlueprint.Bones, 20],
      [CraftingResourcesBlueprint.WoodenSticks, 20],
      [CraftingResourcesBlueprint.IronIngot, 20],
    ]),
  ],
};
