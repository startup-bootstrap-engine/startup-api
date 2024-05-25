import { CraftingResourcesBlueprint, HammersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeFrostSteelHammer: IUseWithCraftingRecipe = {
  outputKey: HammersBlueprint.FrostSteelHammer,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.Bone,
      qty: 40,
    },
    {
      key: CraftingResourcesBlueprint.GoldenOre,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 70,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 50],
};
