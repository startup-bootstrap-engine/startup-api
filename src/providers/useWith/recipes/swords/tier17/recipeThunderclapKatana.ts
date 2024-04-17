import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeThunderclapKatana: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.ThunderclapKatana,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: SwordsBlueprint.ThunderboltCutlass,
      qty: 1,
    },
    {
      key: SwordsBlueprint.Katana,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 150,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 999,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 73],
};
