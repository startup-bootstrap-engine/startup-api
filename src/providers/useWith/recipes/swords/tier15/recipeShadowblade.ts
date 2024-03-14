import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeShadowblade: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.Shadowblade,
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
      key: CraftingResourcesBlueprint.Diamond,
      qty: 150,
    },
    {
      key: CraftingResourcesBlueprint.Jade,
      qty: 150,
    },
    {
      key: MagicsBlueprint.DarkRune,
      qty: 500,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 58],
};
