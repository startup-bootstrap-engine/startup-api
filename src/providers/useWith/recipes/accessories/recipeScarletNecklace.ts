import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";

export const recipeScarletNecklace: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.ScarletNecklace,
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
      key: MagicsBlueprint.DarkRune,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
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
      key: CraftingResourcesBlueprint.Jade,
      qty: 130,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 120,
    },
    {
      key: CraftingResourcesBlueprint.WhisperrootEntwiner,
      qty: 8,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 52],
};
