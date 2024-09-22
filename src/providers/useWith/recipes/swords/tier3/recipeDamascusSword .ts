import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import {
  CraftingResourcesBlueprint,
  MagicsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeDamascusSword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.DamascusSword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 6,
    },
    {
      key: MagicsBlueprint.FireRune,
      qty: 5,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.IronIngot, 3],
      [CraftingResourcesBlueprint.IronNail, 6],
      [CraftingResourcesBlueprint.MagicRecipe, 5],
    ]),
  ],
};
