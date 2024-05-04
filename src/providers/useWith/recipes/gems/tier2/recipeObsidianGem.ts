import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeObsidianGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.ObsidianGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumOre,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionOre,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.BloodrootBlossomFlower,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 37],
};
