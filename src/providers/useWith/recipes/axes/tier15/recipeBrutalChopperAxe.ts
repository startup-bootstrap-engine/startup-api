import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeBrutalChopperAxe: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.BrutalChopperAxe,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.NautilusShell,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.SocialCrystal,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 130,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 56],
};
