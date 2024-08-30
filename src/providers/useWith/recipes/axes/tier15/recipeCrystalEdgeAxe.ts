import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeCrystalEdgeAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.CrystalEdgeAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 56],
};
