import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import {
  BooksBlueprint,
  CraftingResourcesBlueprint,
  MagicsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeMysteryOrb: IUseWithCraftingRecipe = {
  outputKey: BooksBlueprint.MysteryOrb,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 50,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 99,
    },
    {
      key: CraftingResourcesBlueprint.NautilusShell,
      qty: 2,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Alchemy,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.MagicRecipe, 10],
      [CraftingResourcesBlueprint.ObsidiumIngot, 30],
      [CraftingResourcesBlueprint.BlueFeather, 50],
      [MagicsBlueprint.ThunderRune, 99],
      [CraftingResourcesBlueprint.NautilusShell, 2],
    ]),
  ],
};
