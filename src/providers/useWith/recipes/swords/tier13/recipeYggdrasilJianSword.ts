import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeYggdrasilJianSword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.YggdrasilJianSword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 180,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 7,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 42],
};
