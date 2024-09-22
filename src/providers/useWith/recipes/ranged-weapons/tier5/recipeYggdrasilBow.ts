import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeYggdrasilBow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.YggdrasilBow,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Rope,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 1,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Lumberjacking,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.Rope, 2],
      [CraftingResourcesBlueprint.WoodenBoard, 5],
      [CraftingResourcesBlueprint.PhoenixFeather, 15],
      [CraftingResourcesBlueprint.DragonHead, 2],
    ]),
  ],
};
