import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeTurkishGoldenBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.TurkishGoldenBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 15,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Lumberjacking, 18],
};
