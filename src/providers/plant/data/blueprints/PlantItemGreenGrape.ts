import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType, PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemGreenGrape: IPlantItem = {
  key: PlantItemBlueprint.RedGrape,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Green Grape",
  description: "The green grape is a warm-season fruit that thrives in fertile, well-drained soil.",
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
      textureAtlas: "plants/food/green-grape/green-grape-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 15,
      texturePath: "crops",
      textureAtlas: "plants/food/green-grape/green-grape-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 20,
      texturePath: "crops",
      textureAtlas: "plants/food/green-grape/green-grape-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.GreenGrape,
  regrowsAfterHarvest: true,
};
