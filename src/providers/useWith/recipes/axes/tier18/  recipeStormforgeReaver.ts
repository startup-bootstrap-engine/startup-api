import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeStormforgeReaver: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.StormforgeReaver,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 70,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 67],
};
