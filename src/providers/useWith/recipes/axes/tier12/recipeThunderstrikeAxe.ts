import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeThunderstrikeAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.ThunderstrikeAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 50],
};
