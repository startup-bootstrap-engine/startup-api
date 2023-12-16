import { ItemSubType, ItemType, PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemCarrot: IPlantItem = {
  key: PlantItemBlueprint.Carrot,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  textureAtlas: "items",
  texturePath: "plants/carrot.png",
  name: "Carrot",
  description:
    "The carrot is a hardy, cool-season vegetable that thrives in fertile, well-drained soil. With feathery green leaves and a long, conical root, it ranges in color from orange to purple, red, and yellow.",
  isStatic: true,
  isPersistent: true,
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 5,
      texturePath: "items",
      textureAtlas: "plants/carrot-seed.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 10,
      texturePath: "items",
      textureAtlas: "plants/carrot-sprout.png",
    },
    [PlantLifeCycle.YoungPlant]: {
      requiredGrowthPoints: 15,
      texturePath: "items",
      textureAtlas: "plants/carrot-young.png",
    },
    [PlantLifeCycle.MaturePlant]: {
      requiredGrowthPoints: 20,
      texturePath: "items",
      textureAtlas: "plants/carrot-mature.png",
    },
    [PlantLifeCycle.Blooming]: {
      requiredGrowthPoints: 25,
      texturePath: "items",
      textureAtlas: "plants/carrot-bloom.png",
    },
    [PlantLifeCycle.Harvestable]: {
      requiredGrowthPoints: 30,
      texturePath: "items",
      textureAtlas: "plants/carrot-harvest.png",
    },
  },
  regrowsAfterHarvest: true,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
