import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeEmberbrandClaymore: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.EmberbrandClaymore,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 7,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 65],
};
