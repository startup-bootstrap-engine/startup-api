import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeTwilightThornDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.TwilightThornDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 525,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 575,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 550,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 90,
    },
    {
      key: MagicsBlueprint.DarkRune,
      qty: 250,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 76],
};
