import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  PotionsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeLightLifePotion: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.LightLifePotion,
  outputQtyRange: [5, 10],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Herb,
      qty: 3,
    },
    {
      key: FoodsBlueprint.Carrot,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.BloodrootBlossomFlower,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 1],
};
