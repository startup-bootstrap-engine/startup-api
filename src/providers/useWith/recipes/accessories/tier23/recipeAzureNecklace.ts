import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";

export const recipeAzureNecklace: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.AzureNecklace,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Rope,
      qty: 18,
    },
    {
      key: CraftingResourcesBlueprint.Leather,
      qty: 95,
    },
    {
      key: MagicsBlueprint.Rune,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 120,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 55],
};
