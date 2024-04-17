import { CraftingResourcesBlueprint, PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeCorrosiveElixir: IUseWithCraftingRecipe = {
  outputKey: PotionsBlueprint.CorrosiveElixir,
  outputQtyRange: [1, 4],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Herb,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WaterBottle,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.SunspireLotusFlower,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 20],
};
