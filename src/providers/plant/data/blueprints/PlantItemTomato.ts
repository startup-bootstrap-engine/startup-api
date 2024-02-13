import { FARMING_HIGH_YIELD_FACTOR } from "@providers/constants/FarmingConstants";
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
  texturePath: "seeds/seed-red-1.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 10,
      textureAtlas: "crops",
      texturePath: "seeds/seed-red-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 20,
      textureAtlas: "crops",
      texturePath: "plants/food/tomato/tomato-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 30,
      textureAtlas: "crops",
      texturePath: "plants/food/tomato/tomato-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 40,
      textureAtlas: "crops",
      texturePath: "plants/food/tomato/tomato-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Tomato,
  regrowsAfterHarvest: true,
  growthFactor: 1.2,
  yieldFactor: FARMING_HIGH_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
