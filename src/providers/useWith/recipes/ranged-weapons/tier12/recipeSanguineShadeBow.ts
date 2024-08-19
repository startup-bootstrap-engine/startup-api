import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeSanguineShadeBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.SanguineShadeBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 40,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 40],
};
