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
      key: FoodsBlueprint.Potato,
      qty: 1,
    },
    {
      key: FoodsBlueprint.Strawberry,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 1],
};
