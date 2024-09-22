import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeScythianGoldenBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.ScythianGoldenBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WoodenSticks,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 18],
};
