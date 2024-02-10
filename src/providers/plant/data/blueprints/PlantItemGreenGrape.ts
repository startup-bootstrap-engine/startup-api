import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemGreenGrape: IPlantItem = {
  key: PlantItemBlueprint.RedGrape,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Green Grape",
  description: "The green grape is a warm-season fruit that thrives in fertile, well-drained soil.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-green-1.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 5,
      textureAtlas: "crops",
      texturePath: "seeds/seed-green-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 15,
      textureAtlas: "crops",
      texturePath: "plants/food/green-grape/green-grape-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 30,
      textureAtlas: "crops",
      texturePath: "plants/food/green-grape/green-grape-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 45,
      textureAtlas: "crops",
      texturePath: "plants/food/green-grape/green-grape-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.GreenGrape,
  regrowsAfterHarvest: true,
  growthFactor: 1.5,
  maxHarvestablePerPlant: 8,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
