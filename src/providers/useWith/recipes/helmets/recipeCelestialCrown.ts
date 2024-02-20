import { CraftingResourcesBlueprint, HelmetsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeCelestialCrown: IUseWithCraftingRecipe = {
  outputKey: HelmetsBlueprint.CelestialCrown,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.Leather,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.Leather,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 2,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 57],
};
