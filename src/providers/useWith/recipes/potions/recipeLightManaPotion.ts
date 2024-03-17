import { CraftingResourcesBlueprint, PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeLightManaPotion: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.LightManaPotion,
  outputQtyRange: [5, 10],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.DuskwispHerbFlower,
      qty: 2,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 1],
};
