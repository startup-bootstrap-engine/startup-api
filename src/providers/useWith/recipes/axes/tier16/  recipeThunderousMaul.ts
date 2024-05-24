import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeThunderousMaul: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.ThunderousMaul,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.SilverOre,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 59],
};
