import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeVenomousFang: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.VenomousFang,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.Herb,
      qty: 400,
    },
    {
      key: CraftingResourcesBlueprint.Bone,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 250,
    },
    {
      key: MagicsBlueprint.PoisonRune,
      qty: 999,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 62],
};
