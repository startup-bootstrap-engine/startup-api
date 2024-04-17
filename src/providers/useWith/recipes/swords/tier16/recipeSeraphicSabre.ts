import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeSeraphicSaber: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.SeraphicSabre,
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
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 99,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 9,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 69],
};
