import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeCrimsonFangBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.CrimsonFangBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.BlueLeather,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 60,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 32],
};
