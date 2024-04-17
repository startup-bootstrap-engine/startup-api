import { BooksBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeEnigmaScrolls: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.EnigmaScrolls,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.NautilusShell,
      qty: 2,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 20],
};
