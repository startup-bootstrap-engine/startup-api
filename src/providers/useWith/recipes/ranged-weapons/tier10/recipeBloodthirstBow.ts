import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeBloodthirstBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.BloodthirstBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Eye,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 38],
};
