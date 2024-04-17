import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeThunderousClaymore: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.ThunderousClaymore,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 250,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 350,
    },
    {
      key: SwordsBlueprint.ThunderboltCutlass,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 71],
};
