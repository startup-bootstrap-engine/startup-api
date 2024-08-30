import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeShadowfangAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.ShadowfangAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 51],
};
