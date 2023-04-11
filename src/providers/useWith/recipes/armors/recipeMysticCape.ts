import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { ArmorsBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../useWithTypes";

export const recipeMysticCape: IUseWithCraftingRecipe = {
  outputKey: ArmorsBlueprint.MysticCape,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Eye,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.Eye, 10],
      [CraftingResourcesBlueprint.BlueSilk, 10],
      [CraftingResourcesBlueprint.BlueSapphire, 10],
    ]),
  ],
};
