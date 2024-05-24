import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeObsidianEdge: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.ObsidianEdge,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumOre,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 46],
};
