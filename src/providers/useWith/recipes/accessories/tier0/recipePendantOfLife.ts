import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipePendantOfLife: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.PendantOfLife,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.Rope,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.WhisperrootEntwiner,
      qty: 8,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.RedSapphire, 30],
      [CraftingResourcesBlueprint.Rope, 5],
      [CraftingResourcesBlueprint.Skull, 25],
    ]),
  ],
};