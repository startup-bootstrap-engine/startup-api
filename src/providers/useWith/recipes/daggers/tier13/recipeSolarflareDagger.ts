import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeSolarflareDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.SolarflareDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 215,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 235,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 15,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 71],
};
