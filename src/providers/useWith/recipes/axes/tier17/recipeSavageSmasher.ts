import { AxesBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeSavageSmasher: IUseWithCraftingRecipe = {
  outputKey: AxesBlueprint.SavageSmasher,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.SilverOre,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.SunspireLotusFlower,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 80,
    },
    {
      key: CraftingResourcesBlueprint.WoodenBoard,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.Rope,
      qty: 80,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 64],
};
