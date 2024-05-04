import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeMistyQuartzGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.MistyQuartzGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.DuskwispHerbFlower,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 3,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 45],
};
