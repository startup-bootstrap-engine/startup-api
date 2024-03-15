import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import {
  BooksBlueprint,
  CraftingResourcesBlueprint,
  MagicsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeStormbringerGrimoire: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.StormbringerGrimoire,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 8,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 10,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 19,
    },
    {
      key: CraftingResourcesBlueprint.NautilusShell,
      qty: 2,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Alchemy,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.MagicRecipe, 8],
      [CraftingResourcesBlueprint.ObsidiumIngot, 10],
      [CraftingResourcesBlueprint.BlueFeather, 10],
      [MagicsBlueprint.ThunderRune, 19],
      [CraftingResourcesBlueprint.NautilusShell, 2],
    ]),
  ],
};
