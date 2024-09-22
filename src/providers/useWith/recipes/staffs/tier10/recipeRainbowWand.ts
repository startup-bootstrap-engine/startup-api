import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeRainbowWand: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.RainbowWand,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 35,
    },
    {
      key: CraftingResourcesBlueprint.SeaShell,
      qty: 3,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 33],
};
