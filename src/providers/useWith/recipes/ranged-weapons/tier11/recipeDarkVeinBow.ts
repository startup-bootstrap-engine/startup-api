import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeDarkVeinBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.DarkVeinBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 120,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 39],
};
