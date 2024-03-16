import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeEmberglowRapier: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.EmberglowRapier,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 99,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 8,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 67],
};
