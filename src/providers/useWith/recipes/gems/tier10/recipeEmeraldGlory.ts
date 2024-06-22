import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeEmeraldGlory: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.EmeraldGlory,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 225,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 215,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 165,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 60,
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
  minCraftingRequirements: [CraftingSkill.Alchemy, 65],
};
