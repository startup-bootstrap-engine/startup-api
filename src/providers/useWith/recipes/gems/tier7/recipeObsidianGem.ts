import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeObsidianGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.ObsidianGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.DuskwispHerbFlower,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 50],
};
