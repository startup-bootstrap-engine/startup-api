import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeTopazRadiance: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.TopazRadiance,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.SunspireLotusFlower,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 15],
};
