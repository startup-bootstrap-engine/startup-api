import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeDragonfireAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.DragonfireAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumOre,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.SilverOre,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 65],
};
