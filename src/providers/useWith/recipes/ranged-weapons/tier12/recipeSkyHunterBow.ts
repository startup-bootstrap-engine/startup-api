import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeSkyHunterBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.SkyHunterBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 170,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 125,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 40],
};
