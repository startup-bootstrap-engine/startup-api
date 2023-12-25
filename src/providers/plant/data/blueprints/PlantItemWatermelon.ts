import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType, PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemWatermelon: IPlantItem = {
  key: PlantItemBlueprint.Watermelon,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Watermelon",
  description: "Watermelon is a juicy, refreshing fruit often consumed in the summer. It's high in vitamins A and C.",
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
      textureAtlas: "plants/food/watermelon/watermelon-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 15,
      texturePath: "crops",
      textureAtlas: "plants/food/watermelon/watermelon-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 20,
      texturePath: "crops",
      textureAtlas: "plants/food/watermelon/watermelon-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Watermelon,
  regrowsAfterHarvest: true,
};
