import { CraftingResourcesBlueprint, HammersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeShadowHammer: IUseWithCraftingRecipe = {
  outputKey: HammersBlueprint.ShadowHammer,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonTooth,
      qty: 20,
    },
    {
      key: CraftingResourcesBlueprint.ElvenWood,
      qty: 60,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionOre,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.IronNail,
      qty: 25,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 50,
    },
  ],

  minCraftingRequirements: [CraftingSkill.Blacksmithing, 45],
};
