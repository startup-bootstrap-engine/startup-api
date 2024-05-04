import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeEmeraldGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.EmeraldGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 25,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 15],
};
