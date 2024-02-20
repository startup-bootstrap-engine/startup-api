import { FARMING_LOW_YIELD_FACTOR } from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemPumpkin: IPlantItem = {
  key: PlantItemBlueprint.Pumpkin,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Pumpkin",
  description:
    "Pumpkin is a cultivar of winter squash that is round with smooth, slightly ribbed skin, and is most often deep yellow to orange in coloration.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-brown-3.png",
  deadTexturePath: "plants/food/pumpkin/generic-sprout-dead-2.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 10,
      textureAtlas: "crops",
      texturePath: "seeds/seed-brown-3.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 20,
      textureAtlas: "crops",
      texturePath: "plants/food/pumpkin/pumpkin-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 30,
      textureAtlas: "crops",
      texturePath: "plants/food/pumpkin/pumpkin-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 40,
      textureAtlas: "crops",
      texturePath: "plants/food/pumpkin/pumpkin-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Pumpkin,
  regrowsAfterHarvest: false,
  growthFactor: 4.5,
  yieldFactor: FARMING_LOW_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
