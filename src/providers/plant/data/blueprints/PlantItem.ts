import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemSubType, ItemType, PlantItemBlueprint, PlantLifeCycle, Season } from "../types/PlantTypes";

export interface IPlantItem extends Partial<IItem> {
  key: PlantItemBlueprint;
  type: ItemType;
  subType: ItemSubType;
  name: string;
  description: string;
  isStatic: boolean;
  isPersistent: boolean;
  stagesRequirements: {
    [stage in PlantLifeCycle]?: {
      requiredGrowthPoints: number;
      texturePath: string;
      textureAtlas: string;
    };
  };
  harvestableItemKey: string; // item thats generated once its harvested
  regrowsAfterHarvest: boolean; // if true, the plant will go back to stage 2 after being harvested (Young stage)
  availableOnlyOnSeasons?: Season[]; // if empty, it means it's available all year round
  fasterGrowthOnSeasons?: Season[]; // if empty, it means it grows at the same rate all year round
}
