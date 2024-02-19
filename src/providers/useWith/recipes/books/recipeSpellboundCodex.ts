import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import {
  BooksBlueprint,
  CraftingResourcesBlueprint,
  MagicsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeSpellboundCodex: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.SpellboundCodex,
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
      key: CraftingResourcesBlueprint.Leather,
      qty: 3,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 3,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Alchemy,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.MagicRecipe, 6],
      [CraftingResourcesBlueprint.ObsidiumIngot, 4],
      [CraftingResourcesBlueprint.Leather, 3],
    ]),
  ],
};
