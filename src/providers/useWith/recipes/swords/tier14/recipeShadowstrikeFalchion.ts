import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeShadowstrikeFalchion: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.ShadowstrikeFalchion,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.CorruptionIngot,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.Skull,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.Bone,
      qty: 140,
    },
    {
      key: MagicsBlueprint.CorruptionRune,
      qty: 100,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 48],
};
