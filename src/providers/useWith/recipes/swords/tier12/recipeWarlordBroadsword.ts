import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeWarlordBroadsword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.WarlordBroadsword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 100,
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
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 80,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.ElvenWood, 100],
      [CraftingResourcesBlueprint.Bones, 20],
      [CraftingResourcesBlueprint.WoodenSticks, 20],
      [CraftingResourcesBlueprint.GreenIngot, 80],
      [CraftingResourcesBlueprint.SteelIngot, 150],
      [CraftingResourcesBlueprint.GoldenIngot, 80],
    ]),
  ],
};
