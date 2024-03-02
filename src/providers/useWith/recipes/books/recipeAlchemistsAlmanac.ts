import { BooksBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";

export const recipeAlchemistsAlmanac: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.AlchemistsAlmanac,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 40,
    },
    {
      key: MagicsBlueprint.EnergyBoltRune,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 22],
};
