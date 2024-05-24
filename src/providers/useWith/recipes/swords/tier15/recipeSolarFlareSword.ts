import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeSolarFlareSword: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.SolarFlareSword,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 275,
    },
    {
      key: CraftingResourcesBlueprint.Eye,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 200,
    },
    {
      key: MagicsBlueprint.ThunderRune,
      qty: 200,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 58],
};
