import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeSapphireGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.SapphireGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.BlueLeather,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 25,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 20],
};
