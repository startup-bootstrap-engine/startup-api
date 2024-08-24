import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeLifebloodBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.LifebloodBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 60,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 32],
};
