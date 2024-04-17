import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeDualImpactAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.DualImpactAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 45,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 51],
};
