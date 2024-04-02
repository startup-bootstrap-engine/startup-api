import {
  DEFAULT_PLANT_CYCLE,
  FARMING_SUPER_YIELD_FACTOR,
  SUPER_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemSunspireLotus: IPlantItem = {
  key: PlantItemBlueprint.SunspireLotus,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Sunspire Lotus",
  description:
    "Golden petals infused with the vitality of sunlight, prized by warriors for crafting endurance potions that bolster resilience.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-green-1.png",
  deadTexturePath: "plants/magic/sunspire-lotus/generic-sprout-dead.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-green-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/magic/sunspire-lotus/sunspire-lotus-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/magic/sunspire-lotus/sunspire-lotus-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/magic/sunspire-lotus/sunspire-lotus-mature.png",
    },
  },
  harvestableItemKey: CraftingResourcesBlueprint.SunspireLotusFlower,
  regrowsAfterHarvest: true,
  growthFactor: SUPER_GROWTH_FACTOR,
  yieldFactor: FARMING_SUPER_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
  regrowAfterHarvestLimit: 1,
};
