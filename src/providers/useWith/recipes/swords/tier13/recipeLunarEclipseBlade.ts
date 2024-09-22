import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeLunarEclipseBlade: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.LunarEclipseBlade,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 180,
    },
    {
      key: CraftingResourcesBlueprint.Rock,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 7,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 42],
};
