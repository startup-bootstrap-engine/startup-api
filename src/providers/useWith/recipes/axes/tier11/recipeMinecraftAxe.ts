import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeMinecraftAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.MinecraftAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 75,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 45],
};
