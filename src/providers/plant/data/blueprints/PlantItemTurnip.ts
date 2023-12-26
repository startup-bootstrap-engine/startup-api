import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemTurnip: IPlantItem = {
  key: PlantItemBlueprint.Turnip,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Turnip",
  description:
    "The turnip or white turnip is a root vegetable commonly grown in temperate climates worldwide for its white, fleshy taproot.",
  isStatic: true,
  isPersistent: true,
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 5,
      texturePath: "crops",
      textureAtlas: "seeds/seed-brown-2.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 10,
      texturePath: "crops",
      textureAtlas: "plants/food/turnip/turnip-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 15,
      texturePath: "crops",
      textureAtlas: "plants/food/turnip/turnip-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 20,
      texturePath: "crops",
      textureAtlas: "plants/food/turnip/turnip-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Turnip,
  regrowsAfterHarvest: false,
  growthFactor: 3,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
