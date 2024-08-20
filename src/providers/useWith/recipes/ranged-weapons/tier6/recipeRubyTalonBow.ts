import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeRubyTalonBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.RubyTalonBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 28],
};
