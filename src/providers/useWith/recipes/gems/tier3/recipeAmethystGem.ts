import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeAmethystGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.AmethystGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.SunspireLotusFlower,
      qty: 25,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 40],
};
