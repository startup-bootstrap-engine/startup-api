import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeIroncladCleaver: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.IroncladCleaver,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 90,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 59],
};
