import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeGoldenGlimmerRing: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.GoldenGlimmerRing,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 63],
};
