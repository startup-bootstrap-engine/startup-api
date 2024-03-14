import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeVenomousBlade: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.VenomousBlade,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.Herb,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.Bone,
      qty: 140,
    },
    {
      key: MagicsBlueprint.PoisonRune,
      qty: 999,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 50],
};
