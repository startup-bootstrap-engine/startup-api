import { IItem } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { MapHelper } from "@providers/map/MapHelper";
import { MapLoader } from "@providers/map/MapLoader";
import { MapObjectsLoader } from "@providers/map/MapObjectsLoader";
import { ITiledObject } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { plantItemsBlueprintsIndex } from "./data";

interface IPlantSeedData extends Omit<IItem, "_id"> {
  tiledId: number;
}

@provide(PlantLoader)
export class PlantLoader {
  constructor(private mapHelper: MapHelper, private mapObjectsLoader: MapObjectsLoader) {}

  @TrackNewRelicTransaction()
  public async loadPlantSeedData(): Promise<Map<string, IPlantSeedData>> {
    const plantSeedData = new Map<string, IPlantSeedData>();

    for (const [mapName, mapData] of MapLoader.maps.entries()) {
      const plants = this.mapObjectsLoader.getObjectLayerData("Plants", mapData);

      if (!plants?.length) {
        continue;
      }

      const plantKeys = this.getPlantKeys(plants);

      const uniqueArrayKeys = Array.from(new Set(plantKeys));
      this.checkIfPlantBlueprintsExists(uniqueArrayKeys, mapName);

      for (const tiledPlantData of plants) {
        if (!mapName) {
          throw new Error(`PlantLoader: Map name is not found for ${mapName}`);
        }

        const { key, data } = await this.mapHelper.mergeBlueprintWithTiledProps<IPlantSeedData>(
          tiledPlantData,
          mapName,
          null,
          "plants"
        );
        plantSeedData.set(key, data);
      }
    }
    return plantSeedData;
  }

  private getPlantKeys(plants: any[]): string[] {
    return plants.map((plant) => {
      return this.getPropertyFromTiledObject("key", plant) as string;
    });
  }

  public getPropertyFromTiledObject(property: string, obj: ITiledObject): string | undefined {
    const properties = obj.properties;

    if (!properties) {
      return;
    }

    const propertyData = properties.find((prop) => prop.name === property);

    if (!propertyData) {
      return;
    }

    return propertyData.value;
  }

  private checkIfPlantBlueprintsExists(plants: string[], mapName: string): void {
    const missingPlants = plants.filter((plant) => !plantItemsBlueprintsIndex[plant]);

    if (missingPlants.length > 0) {
      throw new Error(
        `❌ PlantLoader: Missing Plant blueprints for keys ${missingPlants.join(
          ", "
        )}. Please, double check the map ${mapName}`
      );
    }
  }
}
