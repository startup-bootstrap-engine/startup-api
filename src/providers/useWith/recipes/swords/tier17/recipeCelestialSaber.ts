import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeCelestialSaber: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.CelestialSaber,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 500,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 500,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.NebulaSeahorn,
      qty: 2,
    },
    {
      key: MagicsBlueprint.HealRune,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 75],
};
