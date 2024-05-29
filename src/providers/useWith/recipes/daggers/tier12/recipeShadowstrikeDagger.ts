import { CraftingResourcesBlueprint, DaggersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeShadowstrikeDagger: IUseWithCraftingRecipe = {
  outputKey: DaggersBlueprint.ShadowstrikeDagger,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 140,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 160,
    },
    {
      key: MagicsBlueprint.DarkRune,
      qty: 10,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 70],
};
