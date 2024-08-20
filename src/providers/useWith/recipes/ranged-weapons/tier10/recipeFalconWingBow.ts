import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeFalconWingBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.FalconWingBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 38],
};
