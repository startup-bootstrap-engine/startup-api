import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeGreenDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.GreenDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 575,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 600,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 140,
    },
    {
      key: MagicsBlueprint.PoisonRune,
      qty: 750,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 77],
};
