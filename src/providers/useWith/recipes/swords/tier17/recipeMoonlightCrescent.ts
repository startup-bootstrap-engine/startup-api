import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeMoonlightCrescent: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.MoonlightCrescent,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: SwordsBlueprint.MoonshadowBlade,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
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
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 76],
};
