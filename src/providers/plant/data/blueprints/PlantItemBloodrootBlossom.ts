import {
  DEFAULT_PLANT_CYCLE,
  FARMING_MEDIUM_YIELD_FACTOR,
  SUPER_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemBloodrootBlossom: IPlantItem = {
  key: PlantItemBlueprint.BloodrootBlossom,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Bloodroot Blossom",
  description: "A crimson bloom pulsing with life, coveted by alchemists for crafting potent healing potions.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-brown-1.png",
  deadTexturePath: "plants/magic/bloodroot-blossom/generic-sprout-dead-2.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-brown-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/magic/bloodroot-blossom/bloodroot-blossom-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/magic/bloodroot-blossom/bloodroot-blossom-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/magic/bloodroot-blossom/bloodroot-blossom-mature.png",
    },
  },
  harvestableItemKey: CraftingResourcesBlueprint.BloodrootBlossomFlower,
  regrowsAfterHarvest: true,
  growthFactor: SUPER_GROWTH_FACTOR,
  yieldFactor: FARMING_MEDIUM_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
  regrowAfterHarvestLimit: 1,
};
