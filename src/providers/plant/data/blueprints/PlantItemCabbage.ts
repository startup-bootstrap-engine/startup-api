import {
  DEFAULT_PLANT_CYCLE,
  FARMING_LOW_YIELD_FACTOR,
  SUPER_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemCabbage: IPlantItem = {
  key: PlantItemBlueprint.Cabbage,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Cabbage",
  description:
    "Cabbage is a leafy green, red, or white biennial plant grown as an annual vegetable crop for its dense-leaved heads.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-green-1.png",
  deadTexturePath: "plants/food/cabbage/cabbage-dead.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-green-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/food/cabbage/cabbage-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/food/cabbage/cabbage-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/food/cabbage/cabbage-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Cabbage,
  regrowsAfterHarvest: false,
  growthFactor: SUPER_GROWTH_FACTOR,
  yieldFactor: FARMING_LOW_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
