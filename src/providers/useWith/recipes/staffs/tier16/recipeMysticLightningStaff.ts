import { CraftingResourcesBlueprint, StaffsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../../../useWithTypes";

export const recipeMysticLightningStaff: IUseWithCraftingRecipe = {
  outputKey: StaffsBlueprint.MysticLightningStaff,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 160,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 75,
    },
    {
      key: CraftingResourcesBlueprint.PrimordialRelic,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.WolfTooth,
      qty: 50,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 160,
    },
    {
      key: CraftingResourcesBlueprint.PrimordialRelic,
      qty: 30,
    },
  ],
  minCraftingRequirements: [CraftingSkill.Alchemy, 40],
};
