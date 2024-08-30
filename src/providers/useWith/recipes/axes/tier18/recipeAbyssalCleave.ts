import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeAbyssalCleave: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.AbyssalCleave,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 35,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 66],
};
