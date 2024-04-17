import {
  DEFAULT_PLANT_CYCLE,
  FARMING_HIGH_YIELD_FACTOR,
  MEDIUM_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemStrawberry: IPlantItem = {
  key: PlantItemBlueprint.Strawberry,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Strawberry",
  description:
    "The garden strawberry is a widely grown hybrid species of the genus Fragaria, collectively known as the strawberries.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-green-1.png",
  deadTexturePath: "plants/food/strawberry/generic-sprout-dead.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-green-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/food/strawberry/strawberry-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/food/strawberry/strawberry-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/food/strawberry/strawberry-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Strawberry,
  regrowsAfterHarvest: true,
  growthFactor: MEDIUM_GROWTH_FACTOR,
  yieldFactor: FARMING_HIGH_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
  regrowAfterHarvestLimit: 1,
};
