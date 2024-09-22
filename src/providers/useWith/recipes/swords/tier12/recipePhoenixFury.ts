import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipePhoenixFury: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.PhoenixFury,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 12,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 37],
};
