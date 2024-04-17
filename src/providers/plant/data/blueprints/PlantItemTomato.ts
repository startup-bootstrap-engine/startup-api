import {
  DEFAULT_PLANT_CYCLE,
  FARMING_MEDIUM_YIELD_FACTOR,
  ULTRA_LOW_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemTomato: IPlantItem = {
  key: PlantItemBlueprint.Tomato,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Tomato",
  description: "The tomato is a warm-season vegetable that is grown in every state, most commonly in home gardens.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-brown-2.png",
  deadTexturePath: "plants/food/tomato/generic-sprout-dead-2.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-brown-2.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/food/tomato/tomato-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/food/tomato/tomato-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/food/tomato/tomato-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Tomato,
  regrowsAfterHarvest: true,
  growthFactor: ULTRA_LOW_GROWTH_FACTOR,
  yieldFactor: FARMING_MEDIUM_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
  regrowAfterHarvestLimit: 1,
};
