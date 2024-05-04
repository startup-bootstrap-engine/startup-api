import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeTopazRadiance: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.TopazRadiance,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.DuskwispHerbFlower,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 60],
};
