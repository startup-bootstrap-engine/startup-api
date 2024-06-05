import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeEtherealVeilDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.EtherealVeilDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 400,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 425,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 375,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 75,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 250,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 77],
};
