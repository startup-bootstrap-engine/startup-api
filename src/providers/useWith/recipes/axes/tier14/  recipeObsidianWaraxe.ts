import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeObsidianWaraxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.ObsidianWaraxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 51],
};
