import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeEmberstrikeAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.EmberstrikeAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 75,
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
      key: CraftingResourcesBlueprint.Skull,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 35,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 51],
};
