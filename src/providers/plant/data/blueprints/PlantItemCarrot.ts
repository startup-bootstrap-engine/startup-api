import {
  DEFAULT_PLANT_CYCLE,
  FARMING_LOW_YIELD_FACTOR,
  ULTRA_LOW_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemCarrot: IPlantItem = {
  key: PlantItemBlueprint.Carrot,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Carrot",
  description: "The carrot is a hardy, cool-season vegetable that thrives in fertile, well-drained soil.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-brown-1.png",
  deadTexturePath: "plants/food/carrot/carrot-dead.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-brown-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/food/carrot/carrot-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/food/carrot/carrot-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/food/carrot/carrot-mature.png",
    },
  },
  growthFactor: ULTRA_LOW_GROWTH_FACTOR,
  regrowsAfterHarvest: false,
  yieldFactor: FARMING_LOW_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
  harvestableItemKey: FoodsBlueprint.Carrot,
};
