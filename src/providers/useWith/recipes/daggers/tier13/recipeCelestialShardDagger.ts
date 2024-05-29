import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeCelestialShardDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.CelestialShardDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 220,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 65,
    },
    {
      key: MagicsBlueprint.CorruptionRune,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 71],
};
