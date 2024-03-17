import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  PotionsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeGreaterLifePotion: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.GreaterLifePotion,
  outputQtyRange: [3, 5],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.MedicinalLeaf,
      qty: 3,
    },
    {
      key: FoodsBlueprint.Strawberry,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.BloodrootBlossomFlower,
      qty: 3,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 15],
};
