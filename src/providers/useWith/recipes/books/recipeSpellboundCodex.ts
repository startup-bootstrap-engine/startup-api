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
      qty: 12,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 30,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WhisperrootEntwiner,
      qty: 8,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Alchemy,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.MagicRecipe, 12],
      [CraftingResourcesBlueprint.ObsidiumIngot, 40],
      [CraftingResourcesBlueprint.BlueFeather, 30],
    ]),
  ],
};
