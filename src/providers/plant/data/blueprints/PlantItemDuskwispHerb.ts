import {
  DEFAULT_PLANT_CYCLE,
  FARMING_LOW_YIELD_FACTOR,
  HIGH_GROWTH_FACTOR,
} from "@providers/constants/FarmingConstants";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { PlantItemBlueprint, PlantLifeCycle } from "../types/PlantTypes";
import { IPlantItem } from "./PlantItem";

export const plantItemDuskwispHerb: IPlantItem = {
  key: PlantItemBlueprint.DuskwispHerb,
  type: ItemType.Plant,
  subType: ItemSubType.Plant,
  name: "Duskwisp Herb",
  description: "Delicate leaves shimmering with ethereal light, sought by wizards to brew rejuvenating mana potions.",
  isStatic: true,
  isPersistent: true,
  weight: 1,
  textureAtlas: "crops",
  texturePath: "seeds/seed-white-1.png",
  deadTexturePath: "plants/magic/duskwisp-herb/generic-sprout-dead.png",
  stagesRequirements: {
    [PlantLifeCycle.Seed]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Seed,
      textureAtlas: "crops",
      texturePath: "seeds/seed-white-1.png",
    },
    [PlantLifeCycle.Sprout]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Sprout,
      textureAtlas: "crops",
      texturePath: "plants/magic/duskwisp-herb/duskwisp-herb-sprout.png",
    },
    [PlantLifeCycle.Young]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Young,
      textureAtlas: "crops",
      texturePath: "plants/magic/duskwisp-herb/duskwisp-herb-young.png",
    },
    [PlantLifeCycle.Mature]: {
      requiredGrowthPoints: DEFAULT_PLANT_CYCLE.Mature,
      textureAtlas: "crops",
      texturePath: "plants/magic/duskwisp-herb/duskwisp-herb-mature.png",
    },
  },
  harvestableItemKey: CraftingResourcesBlueprint.DuskwispHerbFlower,
  regrowsAfterHarvest: false,
  growthFactor: HIGH_GROWTH_FACTOR,
  yieldFactor: FARMING_LOW_YIELD_FACTOR,
  availableOnlyOnSeasons: [],
  fasterGrowthOnSeasons: [],
};
