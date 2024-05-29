import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeWildfireDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.WildfireDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 215,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 240,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 250,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 71],
};
