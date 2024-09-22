import { CraftingResourcesBlueprint, MacesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeYggdrasilKingMace: IUseWithCraftingRecipe = {
  outputKey: MacesBlueprint.YggdrasilKingMace,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 20],
};
