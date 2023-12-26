import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemStrawberry: IPlantItem = {
  key: PlantItemBlueprint.Strawberry,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Strawberry",
  description:
    "The garden strawberry is a widely grown hybrid species of the genus Fragaria, collectively known as the strawberries.",
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
      textureAtlas: "plants/food/strawberry/strawberry-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 15,
      texturePath: "crops",
      textureAtlas: "plants/food/strawberry/strawberry-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 20,
      texturePath: "crops",
      textureAtlas: "plants/food/strawberry/strawberry-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Strawberry,
  regrowsAfterHarvest: true,
  growthFactor: 4,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
