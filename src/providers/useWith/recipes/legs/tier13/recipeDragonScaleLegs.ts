import { CraftingResourcesBlueprint, LegsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeDragonScaleLegs: IUseWithCraftingRecipe = {
  outputKey: LegsBlueprint.DragonScaleLegs,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },

    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.PrimordialRelic,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 75],
};
