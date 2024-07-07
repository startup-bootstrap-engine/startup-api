import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeStormcallerScimitar: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.StormcallerScimitar,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 75,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 48],
};
