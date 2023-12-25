import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType, PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemCarrot: IPlantItem = {
  key: PlantItemBlueprint.Carrot,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Carrot",
  description: "The carrot is a hardy, cool-season vegetable that thrives in fertile, well-drained soil.",
  isStatic: true,
  isPersistent: true,
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 5,
      texturePath: "crops",
      textureAtlas: "seeds/seed-brown-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 10,
      texturePath: "crops",
      textureAtlas: "plants/food/carrot/carrot-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 15,
      texturePath: "crops",
      textureAtlas: "plants/food/carrot/carrot-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 20,
      texturePath: "crops",
      textureAtlas: "plants/food/carrot/carrot-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Carrot,
  regrowsAfterHarvest: false,
};
