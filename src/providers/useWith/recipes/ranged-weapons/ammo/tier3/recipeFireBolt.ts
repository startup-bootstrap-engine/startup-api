import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeFireBolt: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.FireBolt,
  outputQtyRange: [1, 3],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 4,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 1,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Lumberjacking,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.ElvenWood, 4],
      [CraftingResourcesBlueprint.SteelIngot, 1],
      [CraftingResourcesBlueprint.RedSapphire, 1],
    ]),
  ],
};
