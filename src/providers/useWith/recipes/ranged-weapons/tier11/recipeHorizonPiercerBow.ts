import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeHorizonPiercerBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.HorizonPiercerBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 120,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 39],
};
