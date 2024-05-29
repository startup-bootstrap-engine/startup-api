import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeCrimsonLotusDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.CrimsonLotusDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 375,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 400,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 75,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 250,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 77],
};
