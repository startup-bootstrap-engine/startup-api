import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  PotionsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeManaPotion: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.ManaPotion,
  outputQtyRange: [5, 10],
  requiredItems: [
    {
      key: FoodsBlueprint.Eggplant,
      qty: 2,
    },
    {
      key: FoodsBlueprint.Turnip,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.WaterBottle,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 5],
};
