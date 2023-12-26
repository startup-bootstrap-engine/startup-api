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
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 5,
      texturePath: "crops",
      textureAtlas: "seeds/seed-red-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 10,
      texturePath: "crops",
      textureAtlas: "plants/food/tomato/tomato-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 15,
      texturePath: "crops",
      textureAtlas: "plants/food/tomato/tomato-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 20,
      texturePath: "crops",
      textureAtlas: "plants/food/tomato/tomato-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Tomato,
  regrowsAfterHarvest: true,
  growthFactor: 3,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
