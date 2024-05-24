import { CraftingResourcesBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeAuroraBorealisBlade: IUseWithCraftingRecipe = {
  outputKey: SwordsBlueprint.AuroraBorealisBlade,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.GreenIngot,
      qty: 250,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 175,
    },
    {
      key: CraftingResourcesBlueprint.NebulaSeahorn,
      qty: 3,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 5,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Blacksmithing, 64],
};
