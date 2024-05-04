import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeJasperGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.JasperGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.SunspireLotusFlower,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 40],
};
