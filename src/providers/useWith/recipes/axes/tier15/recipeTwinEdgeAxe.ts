import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeTwinEdgeAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.TwinEdgeAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CorruptionOre,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumOre,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 80,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 57],
};
