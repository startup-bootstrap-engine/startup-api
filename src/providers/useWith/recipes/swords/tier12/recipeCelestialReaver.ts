import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeCelestialReaver: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.CelestialReaver,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.Eye,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 36],
};
