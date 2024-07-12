import {
  FARMING_HIGH_YIELD_FACTOR,
  FAST_PLANT_CYCLE,
  SUPER_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemWatermelon: IPlantItem = {
  key: PlantItemBlueprint.Watermelon,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Watermelon",
  description: "Watermelon is a juicy, refreshing fruit often consumed in the summer. It's high in vitamins A and C.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-green-1.png",
  deadTexturePath: "plants/food/watermelon/generic-sprout-dead-2.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: FAST_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-green-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: FAST_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/food/watermelon/watermelon-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: FAST_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/food/watermelon/watermelon-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: FAST_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/food/watermelon/watermelon-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Watermelon,
  regrowsAfterHarvest: true,
  regrowAfterHarvestLimit: 2,
  growthFactor: SUPER_GROWTH_FACTOR,
  yieldFactor: FARMING_HIGH_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
