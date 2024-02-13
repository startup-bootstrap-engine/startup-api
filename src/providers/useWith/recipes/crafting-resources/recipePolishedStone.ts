import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../useWithTypes";

export const recipePolishedStone: IUseWithCraftingRecipe = {
  outputKey: CraftingResourcesBlueprint.PolishedStone,
  outputQtyRange: [1, 4],
  requiredItems: [
    {
      key: RangedWeaponsBlueprint.Stone,
      qty: 20,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, calculateMinimumLevel([[RangedWeaponsBlueprint.Stone, 20]])],
};
