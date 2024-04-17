import { CraftingResourcesBlueprint, PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeGreaterManaPotion: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.GreaterManaPotion,
  outputQtyRange: [3, 5],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.WaterBottle,
      qty: 4,
    },
    {
      key: CraftingResourcesBlueprint.DuskwispHerbFlower,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 20],
};
