import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeStormswiftDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.StormswiftDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 45,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 55,
    },
    {
      key: CraftingResourcesBlueprint.BlueSilk,
      qty: 10,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.ObsidiumIngot, 45],
      [CraftingResourcesBlueprint.Skull, 80],
      [CraftingResourcesBlueprint.SteelIngot, 55],
      [CraftingResourcesBlueprint.BlueSilk, 10],
    ]),
  ],
};
