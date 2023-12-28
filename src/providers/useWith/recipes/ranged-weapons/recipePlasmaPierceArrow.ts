import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipePlasmaPierceArrow: IUseWithCraftingRecipe = {
  outputKey: RangedWeaponsBlueprint.PlasmaPierceArrow,
  outputQtyRange: [5, 10],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronOre,
      qty: 12,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.IronOre, 12],
      [CraftingResourcesBlueprint.BlueFeather, 15],
      [CraftingResourcesBlueprint.PhoenixFeather, 15],
      [CraftingResourcesBlueprint.CorruptionIngot, 10],
    ]),
  ],
};
