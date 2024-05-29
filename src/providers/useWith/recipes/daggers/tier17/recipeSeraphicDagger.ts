import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeSeraphicDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.SeraphicDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 575,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 500,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 490,
    },
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.BlueLeather,
      qty: 100,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 200,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 76],
};
