import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeFlamestrikeBlade: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.FlamestrikeBlade,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 400,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 150,
    },
    {
      key: MagicsBlueprint.FireBoltRune,
      qty: 999,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 54],
};
