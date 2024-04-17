import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeSapphireSerenadeRing: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.SapphireSerenadeRing,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 5,
    },
    {
      key: CraftingResourcesBlueprint.PhoenixFeather,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.BlueFeather,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 30,
    },
    {
      key: CraftingResourcesBlueprint.Silk,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.CopperIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Diamond,
      qty: 10,
    },
    {
      key: CraftingResourcesBlueprint.WhisperrootEntwiner,
      qty: 8,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 62],
};
