import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeIronstormAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.IronstormAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.BatsWing,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.SmallWoodenStick,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 60],
};
