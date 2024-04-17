import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeStormbreaker: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.Stormbreaker,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: SwordsBlueprint.ThunderousClaymore,
      qty: 1,
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
      key: CraftingResourcesBlueprint.NebulaSeahorn,
      qty: 2,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 999,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 72],
};
