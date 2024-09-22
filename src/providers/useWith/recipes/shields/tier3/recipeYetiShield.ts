import {
  CraftingResourcesBlueprint,
  MagicsBlueprint,
  ShieldsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeYetiShield: IUseWithCraftingRecipe = {
  outputKey: ShieldsBlueprint.YetiShield,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 10,
    },
    {
      key: MagicsBlueprint.EnergyBoltRune,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 20],
};
