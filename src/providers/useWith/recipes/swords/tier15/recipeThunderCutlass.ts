import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeThunderCutlass: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.ThunderboltCutlass,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 350,
    },

    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 200,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 650,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 60],
};
