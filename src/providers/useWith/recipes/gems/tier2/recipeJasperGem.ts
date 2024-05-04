import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeJasperGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.JasperGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumOre,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 30],
};
