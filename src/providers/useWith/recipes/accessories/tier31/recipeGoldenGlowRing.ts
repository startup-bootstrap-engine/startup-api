import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeGoldenGlowRing: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.GoldenGlowRing,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.Bandage,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 6,
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
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 64],
};
