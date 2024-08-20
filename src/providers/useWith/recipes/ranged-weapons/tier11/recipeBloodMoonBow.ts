import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeBloodMoonBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.BloodMoonBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 90,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 39],
};
