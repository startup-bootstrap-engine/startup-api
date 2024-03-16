import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeMoonshadowBlade: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.MoonshadowBlade,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 350,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 150,
    },
    {
      key: MagicsBlueprint.DarkRune,
      qty: 450,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 56],
};
