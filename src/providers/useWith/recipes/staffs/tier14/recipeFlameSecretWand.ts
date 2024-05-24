import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeFlameSecretWand: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.FlameSecretWand,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverOre,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.GreenOre,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 37],
};
