import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeBloodmoonBlade: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.BloodmoonBlade,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.NebulaSeahorn,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 64],
};
