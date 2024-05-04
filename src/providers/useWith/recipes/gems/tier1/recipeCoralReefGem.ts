import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeCoralReefGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.CoralReefGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Bones,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 17,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 25,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 25],
};
