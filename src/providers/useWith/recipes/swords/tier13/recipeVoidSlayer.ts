import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeVoidslayer: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.Voidslayer,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 180,
    },
    {
      key: CraftingResourcesBlueprint.Eye,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 7,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 42],
};
