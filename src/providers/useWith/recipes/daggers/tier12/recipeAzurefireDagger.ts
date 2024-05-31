import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeAzurefireDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.AzurefireDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 170,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 165,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 60,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 70],
};
