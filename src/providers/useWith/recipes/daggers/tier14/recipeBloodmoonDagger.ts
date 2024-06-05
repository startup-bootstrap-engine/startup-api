import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeBloodmoonDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.BloodmoonDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 290,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 300,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 65,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 50,
    },
    {
      key: MagicsBlueprint.HealRune,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 72],
};
