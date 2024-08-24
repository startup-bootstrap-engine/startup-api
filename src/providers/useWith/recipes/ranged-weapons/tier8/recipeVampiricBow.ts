import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeVampiricBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.VampiricBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 80,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 33],
};
