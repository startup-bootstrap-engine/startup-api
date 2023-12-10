import {
  RESOURCE_EXPIRATION_TIMEOUT_SECONDS,
  RESOURCE_MAX_GATHERING_PER_TILE_XY,
} from "@providers/constants/ResourceGatheringConstants";
import {} from "@providers/constants/TileConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { IUseWithTargetTile } from "../useWithTypes";

interface ITileData {
  currentCount: number;
  expirationTime: number | null;
}

@provide(UseWithTileExhaustionControl)
export class UseWithTileExhaustionControl {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async incrementResourceDepletion(targetTile: IUseWithTargetTile): Promise<void> {
    const cacheKey = `${targetTile.x}-${targetTile.y}`;
    const tileData = await this.getTileData(cacheKey);

    tileData.currentCount++;
    tileData.expirationTime = Date.now() + RESOURCE_EXPIRATION_TIMEOUT_SECONDS * 1000;

    await this.updateTileData(cacheKey, tileData);
  }

  public async areResourcesDepleted(targetTile: IUseWithTargetTile): Promise<boolean> {
    const cacheKey = `${targetTile.x}-${targetTile.y}`;

    const tileData = await this.getTileData(cacheKey);

    if (tileData.currentCount >= RESOURCE_MAX_GATHERING_PER_TILE_XY) {
      return true;
    }

    return false;
  }

  private async getTileData(cacheKey: string): Promise<ITileData> {
    const data = (await this.inMemoryHashTable.get("use-item-to-tile", cacheKey)) as unknown as string;

    if (!data) {
      return { currentCount: 0, expirationTime: null };
    }

    return JSON.parse(data);
  }

  private async updateTileData(cacheKey: string, tileData: ITileData): Promise<void> {
    await this.inMemoryHashTable.set("use-item-to-tile", cacheKey, JSON.stringify(tileData));
  }

  // Add a method to check and handle the expiration
  public async checkAndExpireTiles(): Promise<void> {
    let tiles = await this.inMemoryHashTable.getAll<ITileData>("use-item-to-tile");

    if (!tiles) {
      return;
    }

    // parse tile values
    tiles = Object.entries(tiles).reduce((acc, [key, value]) => {
      acc[key] = JSON.parse(value as unknown as string);
      return acc;
    }, {} as Record<string, ITileData>);

    const expiredTiles = Object.entries(tiles).filter(([, tileData]) => {
      if (!tileData.expirationTime) {
        return false;
      }

      if (tileData.currentCount < RESOURCE_MAX_GATHERING_PER_TILE_XY) {
        return false;
      }

      return dayjs().isAfter(dayjs(tileData.expirationTime));
    });

    for (const [cacheKey] of expiredTiles) {
      // delete cacheKey
      await this.inMemoryHashTable.delete("use-item-to-tile", cacheKey);
    }
  }
}
