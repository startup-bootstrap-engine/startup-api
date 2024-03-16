import { CraftingResourcesBlueprint, PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeLightManaPotion: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.LightManaPotion,
  outputQtyRange: [5, 10],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.WaterBottle,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.DuskwispHerbFlower,
      qty: 6,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 1],
};
