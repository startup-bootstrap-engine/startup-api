import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeVoidCleaver: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.VoidCleaver,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.IronOre,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.CopperOre,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 65],
};
