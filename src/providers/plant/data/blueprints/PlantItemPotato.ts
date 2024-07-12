import {
  FARMING_MEDIUM_YIELD_FACTOR,
  FAST_PLANT_CYCLE,
  SUPER_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemPotato: IPlantItem = {
  key: PlantItemBlueprint.Potato,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Potato",
  description:
    "Potato is a versatile, carbohydrate-rich food highly popular worldwide and prepared and served in a variety of ways.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-brown-1.png",
  deadTexturePath: "plants/food/potato/potato-dead.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: FAST_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-brown-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: FAST_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/food/potato/potato-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: FAST_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/food/potato/potato-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: FAST_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/food/potato/potato-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Potato,
  regrowsAfterHarvest: true,
  regrowAfterHarvestLimit: 3,
  growthFactor: SUPER_GROWTH_FACTOR,
  yieldFactor: FARMING_MEDIUM_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
