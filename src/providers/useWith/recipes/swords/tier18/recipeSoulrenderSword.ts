import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeSoulrenderSword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.SoulrenderSword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: SwordsBlueprint.StellarBlade,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 750,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 120,
    },
    {
      key: MagicsBlueprint.EnergyBoltRune,
      qty: 500,
    },
    {
      key: CraftingResourcesBlueprint.PrimordialRelic,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 76],
};
