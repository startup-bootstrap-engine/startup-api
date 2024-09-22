import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import {
  BooksBlueprint,
  CraftingResourcesBlueprint,
  MagicsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeMagicOrb: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.MagicOrb,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 20,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 8,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Alchemy,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.MagicRecipe, 10],
      [CraftingResourcesBlueprint.RedSapphire, 30],
      [CraftingResourcesBlueprint.BlueFeather, 20],
      [CraftingResourcesBlueprint.Silk, 20],
    ]),
  ],
};
