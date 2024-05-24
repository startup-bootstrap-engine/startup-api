import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeDoomsdayStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.DoomsdayStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 160,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 115,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 125,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 39],
};
