import { FARMING_MEDIUM_YIELD_FACTOR } from "@providers/constants/FarmingConstants";
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
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 10,
      textureAtlas: "crops",
      texturePath: "seeds/seed-brown-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 20,
      textureAtlas: "crops",
      texturePath: "plants/food/carrot/carrot-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 30,
      textureAtlas: "crops",
      texturePath: "plants/food/carrot/carrot-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 40,
      textureAtlas: "crops",
      texturePath: "plants/food/carrot/carrot-mature.png",
    },
  },
  growthFactor: 1.2,
  regrowsAfterHarvest: false,
  yieldFactor: FARMING_MEDIUM_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
  harvestableItemKey: FoodsBlueprint.Carrot,
};
