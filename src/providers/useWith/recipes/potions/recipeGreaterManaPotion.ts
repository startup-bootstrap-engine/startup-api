import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  PotionsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeGreaterManaPotion: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.GreaterManaPotion,
  outputQtyRange: [3, 5],
  requiredItems: [
    {
      key: FoodsBlueprint.Eggplant,
      qty: 3,
    },
    {
      key: FoodsBlueprint.Turnip,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.WaterBottle,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.SeaShell,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 15],
};
