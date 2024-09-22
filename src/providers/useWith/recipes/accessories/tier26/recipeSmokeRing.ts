import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";

export const recipeSmokeRing: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.SmokeRing,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.BlueLeather,
      qty: 75,
    },
    {
      key: MagicsBlueprint.FireRune,
      qty: 110,
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
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 115,
    },
    {
      key: CraftingResourcesBlueprint.Rope,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 4,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 52],
};
