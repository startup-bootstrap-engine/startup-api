import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill } from "@rpg-engine/shared";

// Minimum level for gathering resources

interface IResourceLevelRequirement {
  [key: string]: {
    minLevel: number;
    type: CraftingSkill;
    item: string;
  };
}

export const RESOURCE_LEVEL_REQUIREMENTS_RATIO = 1;

export const RESOURCE_LEVEL_REQUIREMENTS: IResourceLevelRequirement = {
  [CraftingResourcesBlueprint.PolishedStone]: { minLevel: 1, type: CraftingSkill.Mining, item: ToolsBlueprint.Pickaxe },
  [CraftingResourcesBlueprint.IronOre]: { minLevel: 1, type: CraftingSkill.Mining, item: ToolsBlueprint.Pickaxe },
  [CraftingResourcesBlueprint.CopperOre]: { minLevel: 5, type: CraftingSkill.Mining, item: ToolsBlueprint.Pickaxe },
  [CraftingResourcesBlueprint.SilverOre]: { minLevel: 10, type: CraftingSkill.Mining, item: ToolsBlueprint.Pickaxe },
  [CraftingResourcesBlueprint.GoldenOre]: { minLevel: 20, type: CraftingSkill.Mining, item: ToolsBlueprint.Pickaxe },
  [CraftingResourcesBlueprint.GreenOre]: { minLevel: 30, type: CraftingSkill.Mining, item: ToolsBlueprint.Pickaxe },
  [CraftingResourcesBlueprint.ObsidiumOre]: { minLevel: 40, type: CraftingSkill.Mining, item: ToolsBlueprint.Pickaxe },
  [CraftingResourcesBlueprint.CorruptionOre]: {
    minLevel: 45,
    type: CraftingSkill.Mining,
    item: ToolsBlueprint.Pickaxe,
  },
  [FoodsBlueprint.Tuna]: { minLevel: 1, type: CraftingSkill.Fishing, item: ToolsBlueprint.FishingRod },
  [FoodsBlueprint.BrownFish]: { minLevel: 5, type: CraftingSkill.Fishing, item: ToolsBlueprint.FishingRod },
  [FoodsBlueprint.WildSalmon]: { minLevel: 15, type: CraftingSkill.Fishing, item: ToolsBlueprint.FishingRod },
  [FoodsBlueprint.Salmon]: { minLevel: 25, type: CraftingSkill.Fishing, item: ToolsBlueprint.FishingRod },
  [CraftingResourcesBlueprint.SeaShell]: {
    minLevel: 35,
    type: CraftingSkill.Fishing,
    item: ToolsBlueprint.MoonlureFishingRod,
  },
  [CraftingResourcesBlueprint.NebulaSeahorn]: {
    minLevel: 45,
    type: CraftingSkill.Fishing,
    item: ToolsBlueprint.MoonlureFishingRod,
  },
  [CraftingResourcesBlueprint.NautilusShell]: {
    minLevel: 60,
    type: CraftingSkill.Fishing,
    item: ToolsBlueprint.MoonlureFishingRod,
  },

  [CraftingResourcesBlueprint.SmallWoodenStick]: {
    minLevel: 1,
    type: CraftingSkill.Lumberjacking,
    item: ToolsBlueprint.CarpentersAxe,
  },
  [CraftingResourcesBlueprint.WoodenSticks]: {
    minLevel: 1,
    type: CraftingSkill.Lumberjacking,
    item: ToolsBlueprint.CarpentersAxe,
  },
  [CraftingResourcesBlueprint.GreaterWoodenLog]: {
    minLevel: 5,
    type: CraftingSkill.Lumberjacking,
    item: ToolsBlueprint.WoodBreakerAxe,
  },
  [CraftingResourcesBlueprint.ElvenWood]: {
    minLevel: 15,
    type: CraftingSkill.Lumberjacking,
    item: ToolsBlueprint.ElderHeartAxe,
  },
};
