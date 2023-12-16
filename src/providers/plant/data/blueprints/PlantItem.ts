import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemSubType, ItemType, PlantItemBlueprint, PlantLifeCycle, Season } from "../types/PlantTypes";

export interface IPlantItem extends Partial<IItem> {
  key: PlantItemBlueprint;
  type: ItemType;
  subType: ItemSubType;
  textureAtlas: string;
  texturePath: string;
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
  regrowsAfterHarvest: boolean; // if true, the plant will go back to stage 1 after being harvested (if not, it will be removed from the world)
  availableOnlyOnSeasons: Season[]; // if empty, it means it's available all year round
  fasterGrowthOnSeasons: Season[]; // if empty, it means it grows at the same rate all year round
}
