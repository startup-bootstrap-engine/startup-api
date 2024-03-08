import { BootsBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeWindstriderBoots: IUseWithCraftingRecipe = {
  outputKey: BootsBlueprint.WindstriderBoots,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SocialCrystal,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.SewingThread,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 28],
};
