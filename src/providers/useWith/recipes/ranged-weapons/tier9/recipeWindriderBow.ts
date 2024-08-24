import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeWindriderBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.WindriderBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Eye,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 85,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 80,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 36],
};
