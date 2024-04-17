import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";

export const recipeTwilightEmberNecklace: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.TwilightEmberNecklace,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Rope,
      qty: 18,
    },
    {
      key: CraftingResourcesBlueprint.Leather,
      qty: 95,
    },
    {
      key: MagicsBlueprint.Rune,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.BlueSapphire,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 90,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.WhisperrootEntwiner,
      qty: 8,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 120,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 60],
};
