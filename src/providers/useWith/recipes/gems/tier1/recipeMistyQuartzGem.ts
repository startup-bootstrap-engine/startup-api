import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeMistyQuartzGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.MistyQuartzGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.DuskwispHerbFlower,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 20],
};
