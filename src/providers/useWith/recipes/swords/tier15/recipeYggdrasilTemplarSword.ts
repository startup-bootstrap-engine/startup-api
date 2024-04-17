import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeYggdrasilTemplarSword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.YggdrasilTemplarSword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 63],
};
