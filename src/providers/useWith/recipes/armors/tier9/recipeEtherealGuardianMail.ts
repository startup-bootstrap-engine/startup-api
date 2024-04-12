import { calculateMinimumLevel } from "@providers/crafting/CraftingMinLevelCalculator";
import { ArmorsBlueprint, CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill } from "@rpg-engine/shared";

export const recipeEtherealGuardianMail: IUseWithCraftingRecipe = {
  outputKey: ArmorsBlueprint.EtherealGuardianMail,
  outputQtyRange: [1, 1],
  requiredItems: [
    {
      key: ArmorsBlueprint.TemplarsPlate,
      qty: 1,
    },
    {
      key: CraftingResourcesBlueprint.ObsidiumIngot,
      qty: 300,
    },
    {
      key: CraftingResourcesBlueprint.SteelIngot,
      qty: 300,
    },
    {
      key: CraftingResourcesBlueprint.DragonHead,
      qty: 100,
    },
    {
      key: CraftingResourcesBlueprint.GoldenIngot,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.RedSapphire,
      qty: 200,
    },
    {
      key: CraftingResourcesBlueprint.MagicRecipe,
      qty: 100,
    },
  ],
  minCraftingRequirements: [
    CraftingSkill.Blacksmithing,
    calculateMinimumLevel([
      [CraftingResourcesBlueprint.ObsidiumIngot, 300],
      [CraftingResourcesBlueprint.SteelIngot, 300],
      [CraftingResourcesBlueprint.DragonHead, 100],
      [CraftingResourcesBlueprint.GoldenIngot, 200],
      [CraftingResourcesBlueprint.RedSapphire, 200],
      [CraftingResourcesBlueprint.MagicRecipe, 100],
    ]),
  ],
};
