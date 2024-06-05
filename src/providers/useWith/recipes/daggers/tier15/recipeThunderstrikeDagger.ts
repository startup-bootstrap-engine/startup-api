import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeThunderstrikeDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.ThunderstrikeDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 375,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 390,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 95,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 73],
};
