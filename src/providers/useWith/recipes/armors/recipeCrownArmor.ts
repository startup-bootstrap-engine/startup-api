import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { ArmorsBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../useWithTypes";

export const recipeCrownArmor: IUseWithCraftingRecipe = {
  outputKey: ArmorsBlueprint.CrownArmor,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 20,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.ObsidiumIngot, 15],
      [CraftingResourcesBlueprint.SteelIngot, 25],
      [CraftingResourcesBlueprint.GoldenIngot, 25],
      [CraftingResourcesBlueprint.PhoenixFeather, 20],
      [CraftingResourcesBlueprint.DragonTooth, 10],
      [CraftingResourcesBlueprint.RedSapphire, 20],
    ]),
  ],
};
