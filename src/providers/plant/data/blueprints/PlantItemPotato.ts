import { FARMING_MEDIUM_YIELD_FACTOR } from "@providers/constants/FarmingConstants";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemPotato: IPlantItem = {
  key: PlantItemBlueprint.Potato,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Potato",
  description:
    "Potato is a versatile, carbohydrate-rich food highly popular worldwide and prepared and served in a variety of ways.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-brown-1.png",
  deadTexturePath: "plants/food/potato/potato-dead.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: 5,
      textureAtlas: "crops",
      texturePath: "seeds/seed-brown-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: 10,
      textureAtlas: "crops",
      texturePath: "plants/food/potato/potato-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: 20,
      textureAtlas: "crops",
      texturePath: "plants/food/potato/potato-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: 30,
      textureAtlas: "crops",
      texturePath: "plants/food/potato/potato-mature.png",
    },
  },
  harvestableItemKey: FoodsBlueprint.Potato,
  regrowsAfterHarvest: false,
  growthFactor: 3.5,
  yieldFactor: FARMING_MEDIUM_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
