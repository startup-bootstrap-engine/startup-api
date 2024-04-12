import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { ArmorsBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeSamuraiArmor: IUseWithCraftingRecipe = {
  outputKey: ArmorsBlueprint.SamuraiArmor,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 20,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.ObsidiumIngot, 150],
      [CraftingResourcesBlueprint.SteelIngot, 150],
      [CraftingResourcesBlueprint.GoldenIngot, 150],
      [CraftingResourcesBlueprint.RedSapphire, 200],
    ]),
  ],
};
