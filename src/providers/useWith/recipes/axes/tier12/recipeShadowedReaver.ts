import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeShadowedReaver: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.ShadowedReaver,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.BatsWing,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 70,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 50],
};
