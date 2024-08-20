import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeFalconEyeBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.FalconEyeBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 30],
};
