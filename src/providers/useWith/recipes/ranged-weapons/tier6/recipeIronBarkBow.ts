import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeIronBarkBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.IronBarkBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 30],
};
