import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeRubyGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.RubyGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 22],
};
