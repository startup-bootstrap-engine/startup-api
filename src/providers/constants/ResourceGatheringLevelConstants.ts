import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";

// Minimum level for gathering resources

export const RESOURCE_LEVEL_REQUIREMENTS = {
  mining: {
    [CraftingResourcesBlueprint.PolishedStone]: 0,
    [CraftingResourcesBlueprint.IronOre]: 0,
    [CraftingResourcesBlueprint.CopperOre]: 10,
    [CraftingResourcesBlueprint.GoldenOre]: 30,
    [CraftingResourcesBlueprint.GreenOre]: 35,
    [CraftingResourcesBlueprint.ObsidiumOre]: 40,
    [CraftingResourcesBlueprint.CorruptionOre]: 45,
    ratio: 1,
  },
  fishing: {
    [FoodsBlueprint.Tuna]: 0,
    [FoodsBlueprint.BrownFish]: 20,
    [FoodsBlueprint.WildSalmon]: 30,
    ratio: 1,
  },
  lumberJacking: {
    [CraftingResourcesBlueprint.SmallWoodenStick]: 0,
    [CraftingResourcesBlueprint.WoodenSticks]: 0,
    [CraftingResourcesBlueprint.GreaterWoodenLog]: 10,
    [CraftingResourcesBlueprint.ElvenWood]: 45,
    ratio: 1,
  },
};
