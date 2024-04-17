import { CraftingResourcesBlueprint, MacesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeBoneBreakerClub: IUseWithCraftingRecipe = {
  outputKey: MacesBlueprint.BoneBreakerClub,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.Bandage,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 35,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 90,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 38],
};
