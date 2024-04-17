import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeFrostwindCutter: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.FrostwindCutter,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: SwordsBlueprint.FrostfireLongblade,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
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
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 120,
    },
    {
      key: MagicsBlueprint.CorruptionRune,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.PrimordialRelic,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 78],
};
