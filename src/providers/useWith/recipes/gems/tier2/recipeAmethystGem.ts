import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeAmethystGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.AmethystGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.SunspireLotusFlower,
      qty: 25,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 25],
};
