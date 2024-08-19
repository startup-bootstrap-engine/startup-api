import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeAerialStrikeBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.AerialStrikeBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 140,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 40],
};
