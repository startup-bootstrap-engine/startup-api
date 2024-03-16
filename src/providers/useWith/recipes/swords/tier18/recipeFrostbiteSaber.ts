import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeFrostbiteSaber: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.FrostbiteSaber,
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
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 120,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 999,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 76],
};
