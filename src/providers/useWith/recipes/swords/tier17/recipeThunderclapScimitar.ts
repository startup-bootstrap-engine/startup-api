import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeThunderclapScimitar: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.ThunderclapScimitar,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 500,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 500,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 2,
    },
    {
      key: MagicsBlueprint.HealRune,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 75],
};
