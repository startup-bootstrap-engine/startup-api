import { FARMING_SUPER_YIELD_FACTOR, LOW_GROWTH_FACTOR, SLOW_PLANT_CYCLE } from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemRedGrape: IPlantItem = {
  key: PlantItemBlueprint.RedGrape,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Red Grape",
  description: "The red grape is a warm-season fruit that thrives in fertile, well-drained soil.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-green-1.png",
  deadTexturePath: "plants/food/red-grape/generic-sprout-3-dead.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: SLOW_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-green-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: SLOW_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/food/red-grape/red-grape-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: SLOW_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/food/red-grape/red-grape-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: SLOW_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/food/red-grape/red-grape-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.RedGrape,
  regrowsAfterHarvest: true,
  growthFactor: LOW_GROWTH_FACTOR,
  yieldFactor: FARMING_SUPER_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
  regrowAfterHarvestLimit: 1,
};
