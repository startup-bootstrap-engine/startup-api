import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeCelestialDefender: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.CelestialDefender,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: SwordsBlueprint.CelestialEdge,
      qty: 1,
    },
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
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 50,
    },
    {
      key: MagicsBlueprint.HealRune,
      qty: 500,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.PrimordialRelic,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 74],
};
