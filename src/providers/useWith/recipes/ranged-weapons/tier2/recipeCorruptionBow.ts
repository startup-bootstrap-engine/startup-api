import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeCorruptionBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.CorruptionBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SilverIngot,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 5,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Lumberjacking,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.SilverIngot, 5],
      [CraftingResourcesBlueprint.ColoredFeather, 5],
      [CraftingResourcesBlueprint.ElvenWood, 5],
    ]),
  ],
};
