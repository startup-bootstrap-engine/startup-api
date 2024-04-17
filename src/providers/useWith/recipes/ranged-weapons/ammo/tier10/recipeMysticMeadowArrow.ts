import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeMysticMeadowArrow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.MysticMeadowArrow,
  outputQtyRange: [2, 7],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.ElvenLeaf,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Herb,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.Feather,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.WoodenBoard, 15],
      [CraftingResourcesBlueprint.ElvenLeaf, 10],
      [CraftingResourcesBlueprint.Herb, 10],
      [CraftingResourcesBlueprint.Feather, 10],
    ]),
  ],
};
