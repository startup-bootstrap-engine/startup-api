import { BooksBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";

export const recipeAlchemistsAlmanac: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.AlchemistsAlmanac,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 6,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 4,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 4,
    },
    {
      key: MagicsBlueprint.EnergyBoltRune,
      qty: 6,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 2,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 22],
};
