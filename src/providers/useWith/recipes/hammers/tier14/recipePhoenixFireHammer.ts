import { CraftingResourcesBlueprint, HammersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipePhoenixFireHammer: IUseWithCraftingRecipe = {
  outputKey: HammersBlueprint.PhoenixFireHammer,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.BlueLeather,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.Bone,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.Feather,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 45,
    },
  ],

  minCraftingRequirements: [CraftingSkill.Blacksmithing, 44],
};
