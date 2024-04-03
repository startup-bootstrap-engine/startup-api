import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeFireburstWand: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.FireburstWand,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.SeaShell,
      qty: 3,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 33],
};