import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeInfernalSlicer: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.InfernalSlicer,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: SwordsBlueprint.FireSword,
      qty: 10,
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
      key: CraftingResourcesBlueprint.Skull,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.PrimordialRelic,
      qty: 1,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 80],
};
