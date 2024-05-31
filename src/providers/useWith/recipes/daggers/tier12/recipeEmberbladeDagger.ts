import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeEmberbladeDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.EmberbladeDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 145,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 155,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 65,
    },
    {
      key: MagicsBlueprint.FireRune,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 70],
};
