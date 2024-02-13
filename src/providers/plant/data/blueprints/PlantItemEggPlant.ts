import { FARMING_MEDIUM_YIELD_FACTOR } from "@providers/constants/FarmingConstants";
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
  texturePath: "seeds/seed-purple-1.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 10,
      textureAtlas: "crops",
      texturePath: "seeds/seed-purple-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 20,
      textureAtlas: "crops",
      texturePath: "plants/food/eggplant/eggplant-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 30,
      textureAtlas: "crops",
      texturePath: "plants/food/eggplant/eggplant-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 40,
      textureAtlas: "crops",
      texturePath: "plants/food/eggplant/eggplant-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Eggplant,
  regrowsAfterHarvest: true,
  growthFactor: 2.5,
  yieldFactor: FARMING_MEDIUM_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
