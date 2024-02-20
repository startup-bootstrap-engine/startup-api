import { AccessoriesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";

export const recipeGildedNecklace: IUseWithCraftingRecipe = {
  outputKey: AccessoriesBlueprint.GildedNecklace,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.Rope,
      qty: 18,
    },
    {
      key: CraftingResourcesBlueprint.Leather,
      qty: 90,
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
      key: CraftingResourcesBlueprint.PolishedStone,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 110,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 110,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 50],
};
