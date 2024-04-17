import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import {
  BooksBlueprint,
  CraftingResourcesBlueprint,
  MagicsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeArcaneArbiterChronicles: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.ArcaneArbiterChronicles,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 30,
    },
    {
      key: MagicsBlueprint.EnergyBoltRune,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.NautilusShell,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.WhisperrootEntwiner,
      qty: 8,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Alchemy,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.MagicRecipe, 15],
      [CraftingResourcesBlueprint.PhoenixFeather, 30],
      [CraftingResourcesBlueprint.GoldenIngot, 30],
    ]),
  ],
};
