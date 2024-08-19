import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeTalonStrikeBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.TalonStrikeBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 38],
};
