import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeShadowShredder: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.ShadowShredder,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.NautilusShell,
      qty: 2,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 4,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 64],
};
