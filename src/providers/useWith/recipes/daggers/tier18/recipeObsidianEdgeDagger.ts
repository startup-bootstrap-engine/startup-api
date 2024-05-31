import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeObsidianEdgeDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.ObsidianEdgeDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.IronIngot,
      qty: 600,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 675,
    },
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 575,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 15,
    },
    {
      key: CraftingResourcesBlueprint.ColoredFeather,
      qty: 100,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 750,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 77],
};
