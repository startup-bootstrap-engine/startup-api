import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeCelestialEdge: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.CelestialEdge,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
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
      key: CraftingResourcesBlueprint.NebulaSeahorn,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 72],
};
