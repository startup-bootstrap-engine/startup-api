import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType, PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemEggPlant: IPlantItem = {
  key: PlantItemBlueprint.Eggplant,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Eggplant",
  description:
    "The eggplant, aubergine, or brinjal is a plant species in the nightshade family Solanaceae. Its fruit is high in fiber and low in calories.",
  isStatic: true,
  isPersistent: true,
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 5,
      texturePath: "crops",
      textureAtlas: "seeds/seed-purple-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 10,
      texturePath: "crops",
      textureAtlas: "plants/food/eggplant/eggplant-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 15,
      texturePath: "crops",
      textureAtlas: "plants/food/eggplant/eggplant-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 20,
      texturePath: "crops",
      textureAtlas: "plants/food/eggplant/eggplant-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Eggplant,
  regrowsAfterHarvest: true,
};
