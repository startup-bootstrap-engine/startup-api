import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  PotionsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeLifePotion: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.LifePotion,
  outputQtyRange: [5, 10],
  requiredItems: [
    {
      key: FoodsBlueprint.Strawberry,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.BloodrootBlossomFlower,
      qty: 2,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 5],
};
