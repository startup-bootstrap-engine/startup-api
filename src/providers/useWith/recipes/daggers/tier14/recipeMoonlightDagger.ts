import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeMoonlightDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.MoonlightDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 315,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 320,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 330,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 50,
    },
    {
      key: MagicsBlueprint.DarkRune,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 72],
};
