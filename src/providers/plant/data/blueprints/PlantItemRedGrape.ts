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
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 5,
      texturePath: "crops",
      textureAtlas: "seeds/seed-green-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 10,
      texturePath: "crops",
      textureAtlas: "plants/food/red-grape/red-grape-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 15,
      texturePath: "crops",
      textureAtlas: "plants/food/red-grape/red-grape-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 20,
      texturePath: "crops",
      textureAtlas: "plants/food/red-grape/red-grape-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.RedGrape,
  regrowsAfterHarvest: true,
  growthFactor: 5,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
