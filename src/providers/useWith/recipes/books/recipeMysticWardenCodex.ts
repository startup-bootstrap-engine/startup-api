import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { BooksBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeMysticWardenCodex: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.MysticWardenCodex,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.BlueLeather,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WhisperrootEntwiner,
      qty: 8,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Alchemy,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.MagicRecipe, 10],
      [CraftingResourcesBlueprint.PhoenixFeather, 20],
      [CraftingResourcesBlueprint.ElvenLeaf, 30],
      [CraftingResourcesBlueprint.BlueLeather, 10],
    ]),
  ],
};
