import { IItem } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { blueprintManager } from "@providers/inversify/container";
import { MapHelper } from "@providers/map/MapHelper";
import { MapLoader } from "@providers/map/MapLoader";
import { MapObjectsLoader } from "@providers/map/MapObjectsLoader";
import { ITiledObject } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { AvailableBlueprints } from "./data/types/itemsBlueprintTypes";

//! Main goal of a loader is to merge Tiled data with our blueprints data.

export interface IItemSeedData extends Omit<IItem, "_id"> {
  tiledId: number;
}
@provide(ItemLoader)
export class ItemLoader {
  constructor(private mapHelper: MapHelper, private mapObjectsLoader: MapObjectsLoader) {}

  @TrackNewRelicTransaction()
  public async loadItemSeedData(): Promise<Map<string, IItemSeedData>> {
    const itemSeedData = new Map<string, IItemSeedData>();

    for (const [mapName, mapData] of MapLoader.maps.entries()) {
      const items = this.mapObjectsLoader.getObjectLayerData("Items", mapData);

      if (!items?.length) {
        continue;
      }

      const itemKeys = this.getItemKeys(items);

      const uniqueArrayKeys = Array.from(new Set(itemKeys));
      await this.checkIfItemBlueprintsExists(uniqueArrayKeys, mapName);

      for (const tiledItemData of items) {
        if (!mapName) {
          throw new Error(`ItemLoader: Map name is not found for ${mapName}`);
        }

        const { key, data } = await this.mapHelper.mergeBlueprintWithTiledProps<IItemSeedData>(
          tiledItemData,
          mapName,
          null,
          "items"
        );

        itemSeedData.set(key, data);
      }
    }

    return itemSeedData;
  }

  public getPropertyFromTiledObject(property: string, obj: ITiledObject): string | undefined {
    const properties = obj.properties;

    if (!properties) {
      return;
    }

    // eslint-disable-next-line mongoose-lean/require-lean
    const propertyData = properties.find((prop) => prop.name === property);

    if (!propertyData) {
      return;
    }

    return propertyData.value;
  }

  private getItemKeys(items: any[]): string[] {
    return items.map((item) => {
      return this.getPropertyFromTiledObject("key", item) as string;
    });
  }

  private async checkIfItemBlueprintsExists(items: string[], mapName: string): Promise<void> {
    const itemBlueprintsPromises = items.map(
      async (item) => await blueprintManager.getBlueprint<IItem>("items", item as AvailableBlueprints)
    );
    const itemBlueprints = await Promise.all(itemBlueprintsPromises);

    const missingItems = items.filter((item, index) => !itemBlueprints[index]);

    if (missingItems.length > 0) {
      throw new Error(
        `❌ ItemLoader: Missing Item blueprints for keys ${missingItems.join(
          ", "
        )}. Please, double check the map ${mapName}`
      );
    }
  }
}
