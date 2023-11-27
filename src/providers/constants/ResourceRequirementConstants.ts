import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";

// Minimum level for gathering resources

export const RESOURCE_LEVEL_REQUIREMENTS = {
  [CraftingResourcesBlueprint.PolishedStone]: { minLevel: 1, type: "mining", item: ToolsBlueprint.Pickaxe, ratio: 1 },
  [CraftingResourcesBlueprint.IronOre]: { minLevel: 1, type: "mining", item: ToolsBlueprint.Pickaxe, ratio: 1 },
  [CraftingResourcesBlueprint.CopperOre]: { minLevel: 10, type: "mining", item: ToolsBlueprint.Pickaxe, ratio: 1 },
  [CraftingResourcesBlueprint.GoldenOre]: { minLevel: 30, type: "mining", item: ToolsBlueprint.Pickaxe, ratio: 1 },
  [CraftingResourcesBlueprint.GreenOre]: { minLevel: 35, type: "mining", item: ToolsBlueprint.Pickaxe, ratio: 1 },
  [CraftingResourcesBlueprint.ObsidiumOre]: { minLevel: 40, type: "mining", item: ToolsBlueprint.Pickaxe, ratio: 1 },
  [CraftingResourcesBlueprint.CorruptionOre]: { minLevel: 45, type: "mining", item: ToolsBlueprint.Pickaxe, ratio: 1 },
  [FoodsBlueprint.Tuna]: { minLevel: 1, type: "fishing", item: ToolsBlueprint.FishingRod, ratio: 1 },
  [FoodsBlueprint.BrownFish]: { minLevel: 20, type: "fishing", item: ToolsBlueprint.FishingRod, ratio: 1 },
  [FoodsBlueprint.WildSalmon]: { minLevel: 30, type: "fishing", item: ToolsBlueprint.FishingRod, ratio: 1 },
  [CraftingResourcesBlueprint.SmallWoodenStick]: {
    minLevel: 1,
    type: "lumberjacking",
    item: ToolsBlueprint.CarpentersAxe,
    ratio: 1,
  },
  [CraftingResourcesBlueprint.WoodenSticks]: {
    minLevel: 1,
    type: "lumberjacking",
    item: ToolsBlueprint.CarpentersAxe,
    ratio: 1,
  },
  [CraftingResourcesBlueprint.GreaterWoodenLog]: {
    minLevel: 10,
    type: "lumberjacking",
    item: ToolsBlueprint.CarpentersAxe,
    ratio: 1,
  },
  [CraftingResourcesBlueprint.ElvenWood]: {
    minLevel: 45,
    type: "lumberjacking",
    item: ToolsBlueprint.CarpentersAxe,
    ratio: 1,
  },
};
