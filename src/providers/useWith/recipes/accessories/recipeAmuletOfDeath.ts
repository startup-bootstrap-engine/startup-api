import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeAmuletOfDeath: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.AmuletOfDeath,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SocialCrystal,
      qty: 50,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 25],
};
