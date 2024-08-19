import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeFalconFeatherBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.FalconFeatherBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 60,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 32],
};
