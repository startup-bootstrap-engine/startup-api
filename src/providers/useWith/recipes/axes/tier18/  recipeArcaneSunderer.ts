import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeArcaneSunderer: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.ArcaneSunderer,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 35,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 66],
};
