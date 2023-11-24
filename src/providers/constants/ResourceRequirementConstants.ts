import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";

// Minimum level for gathering resources

export const RESOURCE_LEVEL_REQUIREMENTS = {
  [CraftingResourcesBlueprint.PolishedStone]: { minLevel: 1, type: "mining" },
  [CraftingResourcesBlueprint.IronOre]: { minLevel: 1, type: "mining" },
  [CraftingResourcesBlueprint.CopperOre]: { minLevel: 10, type: "mining" },
  [CraftingResourcesBlueprint.GoldenOre]: { minLevel: 30, type: "mining" },
  [CraftingResourcesBlueprint.GreenOre]: { minLevel: 35, type: "mining" },
  [CraftingResourcesBlueprint.ObsidiumOre]: { minLevel: 40, type: "mining" },
  [CraftingResourcesBlueprint.CorruptionOre]: { minLevel: 45, type: "mining" },
  [FoodsBlueprint.Tuna]: { minLevel: 1, type: "fishing" },
  [FoodsBlueprint.BrownFish]: { minLevel: 20, type: "fishing" },
  [FoodsBlueprint.WildSalmon]: { minLevel: 30, type: "fishing" },
  [CraftingResourcesBlueprint.SmallWoodenStick]: { minLevel: 1, type: "lumberjacking" },
  [CraftingResourcesBlueprint.WoodenSticks]: { minLevel: 1, type: "lumberjacking" },
  [CraftingResourcesBlueprint.GreaterWoodenLog]: { minLevel: 10, type: "lumberjacking" },
  [CraftingResourcesBlueprint.ElvenWood]: { minLevel: 45, type: "lumberjacking" },
};
