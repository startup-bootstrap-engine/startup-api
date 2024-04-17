import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipePlasmaPierceArrow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.PlasmaPierceArrow,
  outputQtyRange: [5, 10],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 12,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 30],
};
