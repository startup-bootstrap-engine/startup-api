import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeFrostbitFang: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.FrostbiteFang,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 300,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 8,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 46],
};
