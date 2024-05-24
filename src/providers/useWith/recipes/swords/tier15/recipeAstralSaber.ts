import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeAstralSaber: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.AstralSaber,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 300,
    },
    {
      key: CraftingResourcesBlueprint.Bone,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.Rock,
      qty: 150,
    },
    {
      key: MagicsBlueprint.HealRune,
      qty: 375,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 56],
};
