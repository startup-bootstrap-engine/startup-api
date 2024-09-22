import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeLightningWand: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.LightningWand,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 140,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 36],
};
