import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeCoralReefGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.CoralReefGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.NautilusShell,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.SeaShell,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 25,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 30],
};
