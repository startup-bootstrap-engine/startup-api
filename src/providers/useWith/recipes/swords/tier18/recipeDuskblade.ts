import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeDuskblade: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.Duskblade,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: SwordsBlueprint.CopperveinBlade,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 750,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 300,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 120,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 500,
    },
    {
      key: CraftingResourcesBlueprint.PrimordialRelic,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 77],
};
