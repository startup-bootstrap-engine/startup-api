import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeBloodthornBroadsword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.BloodthornBroadsword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 400,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 550,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 450,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.NebulaSeahorn,
      qty: 2,
    },
    {
      key: MagicsBlueprint.DarkRune,
      qty: 650,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 75],
};
