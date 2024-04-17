import { CraftingResourcesBlueprint, PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeLightLifePotion: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.LightLifePotion,
  outputQtyRange: [5, 10],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BloodrootBlossomFlower,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 1],
};
