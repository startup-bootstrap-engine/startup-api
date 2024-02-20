import { BooksBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipePotioncraftPrimer: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.PotioncraftPrimer,
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
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 6,
    },
    {
      key: CraftingResourcesBlueprint.BlueLeather,
      qty: 2,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 18],
};
