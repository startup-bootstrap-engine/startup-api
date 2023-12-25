import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType, PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemCabbage: IPlantItem = {
  key: PlantItemBlueprint.Cabbage,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Cabbage",
  description:
    "Cabbage is a leafy green, red, or white biennial plant grown as an annual vegetable crop for its dense-leaved heads.",
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
      textureAtlas: "plants/food/cabbage/cabbage-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 15,
      texturePath: "crops",
      textureAtlas: "plants/food/cabbage/cabbage-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 20,
      texturePath: "crops",
      textureAtlas: "plants/food/cabbage/cabbage-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Cabbage,
  regrowsAfterHarvest: false,
};
