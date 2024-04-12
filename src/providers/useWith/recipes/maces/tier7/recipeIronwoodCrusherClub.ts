import { CraftingResourcesBlueprint, MacesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeIronWoodCrusherClub: IUseWithCraftingRecipe = {
  outputKey: MacesBlueprint.IronWoodCrusherClub,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 55,
    },
    {
      key: CraftingResourcesBlueprint.SocialCrystal,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 35,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 36],
};
