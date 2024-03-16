import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeVenomousSinger: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.VenomousStinger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.Herb,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.Bone,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 150,
    },
    {
      key: MagicsBlueprint.PoisonRune,
      qty: 999,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 52],
};
