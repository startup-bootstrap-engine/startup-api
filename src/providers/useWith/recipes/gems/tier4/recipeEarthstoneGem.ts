import { CraftingResourcesBlueprint, GemsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeEarthstoneGem: IUseWithCraftingRecipe = {
  outputKey: GemsBlueprint.EarthstoneGem,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WhisperrootEntwiner,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 35],
};
