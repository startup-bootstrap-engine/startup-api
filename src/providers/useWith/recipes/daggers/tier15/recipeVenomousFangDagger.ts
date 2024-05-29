import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeVenomousFangDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.VenomousFangDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 380,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 85,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 75,
    },
    {
      key: MagicsBlueprint.PoisonRune,
      qty: 200,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 73],
};
