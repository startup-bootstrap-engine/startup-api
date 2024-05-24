import { CraftingResourcesBlueprint, HammersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeThunderForgedHammer: IUseWithCraftingRecipe = {
  outputKey: HammersBlueprint.ThunderForgedHammer,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.BatsWing,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 50,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 48],
};
