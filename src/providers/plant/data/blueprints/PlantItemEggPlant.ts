import {
  DEFAULT_PLANT_CYCLE,
  FARMING_MEDIUM_YIELD_FACTOR,
  MEDIUM_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemEggPlant: IPlantItem = {
  key: PlantItemBlueprint.Eggplant,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Eggplant",
  description:
    "The eggplant, aubergine, or brinjal is a plant species in the nightshade family Solanaceae. Its fruit is high in fiber and low in calories.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-brown-1.png",
  deadTexturePath: "plants/food/eggplant/generic-sprout-dead-2.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-brown-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/food/eggplant/eggplant-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/food/eggplant/eggplant-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/food/eggplant/eggplant-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Eggplant,
  regrowsAfterHarvest: true,
  growthFactor: MEDIUM_GROWTH_FACTOR,
  yieldFactor: FARMING_MEDIUM_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
  regrowAfterHarvestLimit: 2,
};
