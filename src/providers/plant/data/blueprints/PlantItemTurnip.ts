import {
  DEFAULT_PLANT_CYCLE,
  FARMING_MEDIUM_YIELD_FACTOR,
  ULTRA_LOW_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemTurnip: IPlantItem = {
  key: PlantItemBlueprint.Turnip,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Turnip",
  description:
    "The turnip or white turnip is a root vegetable commonly grown in temperate climates worldwide for its white, fleshy taproot.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-brown-2.png",
  deadTexturePath: "plants/food/turnip/generic-sprout-dead-2.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-brown-2.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/food/turnip/turnip-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/food/turnip/turnip-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/food/turnip/turnip-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Turnip,
  regrowsAfterHarvest: false,
  growthFactor: ULTRA_LOW_GROWTH_FACTOR,
  yieldFactor: FARMING_MEDIUM_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
