import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";
export const recipeShadowLordWand: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.ShadowLordWand,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 160,
    },
    {
      key: CraftingResourcesBlueprint.NautilusShell,
      qty: 30,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 40],
};
