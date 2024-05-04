import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeEarthstoneGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.EarthstoneGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Herb,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.GreenOre,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 34],
};
