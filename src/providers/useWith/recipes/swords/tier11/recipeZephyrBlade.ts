import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeZephyrBlade: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.ZephyrBlade,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.Bones,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 130,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 35],
};
