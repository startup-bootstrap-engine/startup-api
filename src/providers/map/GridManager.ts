import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { MapLayers } from "@rpg-engine/shared";
import PF from "pathfinding";
import mapVersions from "../../../public/config/map-versions.json";
import { MapProperties } from "./MapProperties";
import { MapSolids } from "./MapSolids";
import { MapGridSolidsStorage } from "./storage/MapGridSolidsStorage";

export interface IGridCourse {
  start: { x: number; y: number };
  end: { x: number; y: number };
  offset?: number;
}

export interface IGridBounds {
  startX: number;
  startY: number;
  height: number;
  width: number;
}

interface IGridBetweenPoints {
  grid: PF.Grid;
  startX: number;
  startY: number;
}

@provideSingleton(GridManager)
export class GridManager {
  private grids: Map<string, Uint8Array> = new Map();

  constructor(
    private mapSolids: MapSolids,
    private mapGridSolidsStorage: MapGridSolidsStorage,
    private mapProperties: MapProperties
  ) {}

  public getGrid(map: string): Uint8Array | undefined {
    return this.grids.get(map);
  }

  public hasGrid(map: string): boolean {
    return !!this.grids.get(map);
  }

  @TrackNewRelicTransaction()
  public async generateGridSolids(map: string): Promise<void> {
    const bounds = this.mapProperties.getMapDimensions(map, true);
    const offset = this.mapProperties.getMapOffset(bounds.startX, bounds.startY)!;
    const currentMapVersion = mapVersions[map];

    const storedMapVersion = await this.mapGridSolidsStorage.getGridSolidsVersion(map);

    if (storedMapVersion === currentMapVersion) {
      const tree = await this.mapGridSolidsStorage.getGridSolids(map);
      if (!tree) throw new Error(`❌Could not find grid for map: ${map}`);
      this.grids.set(map, new Uint8Array(tree as any));
      return;
    }

    await this.mapGridSolidsStorage.deleteGridSolids(map);

    const tree = new Uint8Array(bounds.width * bounds.height);

    for (let gridY = bounds.startY; gridY < bounds.height; gridY++) {
      for (let gridX = bounds.startX; gridX < bounds.width; gridX++) {
        const isSolid = this.mapSolids.isTileSolid(map, gridX, gridY, MapLayers.Character);
        const isPassage = this.mapSolids.isTilePassage(map, gridX, gridY, MapLayers.Character);
        const isWalkable = !isSolid || isPassage;

        const offsetX = gridX + offset.gridOffsetX;
        const offsetY = gridY + offset.gridOffsetY;

        tree[offsetY * bounds.width + offsetX] = isWalkable ? 0 : 1;
      }
    }

    await this.mapGridSolidsStorage.setGridSolids(map, Array.from(tree as any));
    this.grids.set(map, tree);
  }

  @TrackNewRelicTransaction()
  public async isWalkable(map: string, gridX: number, gridY: number): Promise<boolean | undefined> {
    try {
      const grid = await this.getGrid(map);
      if (!grid) throw new Error(`❌Could not find grid for map: ${map}`);

      const bounds = this.mapProperties.getMapDimensions(map);
      const offset = this.mapProperties.getMapOffset(bounds.startX, bounds.startY)!;

      return grid[(gridY + offset.gridOffsetY) * bounds.width + (gridX + offset.gridOffsetX)] === 0;
    } catch (error) {
      console.error(`Failed to check isWalkable for gridX ${gridX}, gridY ${gridY}:`, error);
    }
  }

  public async setWalkable(map: string, gridX: number, gridY: number, walkable: boolean): Promise<void> {
    try {
      const grid = await this.getGrid(map);
      if (!grid) throw new Error(`❌Could not find grid for map: ${map}`);

      const bounds = this.mapProperties.getMapDimensions(map);
      const offset = this.mapProperties.getMapOffset(bounds.startX, bounds.startY)!;

      const index = (gridY + offset.gridOffsetY) * bounds.width + (gridX + offset.gridOffsetX);
      grid[index] = walkable ? 0 : 1;

      // TODO: Implement efficient way to update Redis with the change
    } catch (error) {
      console.error(`Failed to setWalkable=${walkable} for gridX ${gridX}, gridY ${gridY} on map ${map}:`, error);
    }
  }

  public generateGridBetweenPoints(map: string, gridCourse: IGridCourse): IGridBetweenPoints {
    const tree = this.getGrid(map);
    if (!tree || tree.length === 0) throw new Error(`❌ The tree is empty or not defined for map: ${map}`);

    const dimens = this.mapProperties.getMapDimensions(map);
    const offset = this.mapProperties.getMapOffset(dimens.startX, dimens.startY)!;
    if (!offset) throw new Error(`❌ Offset is not defined for startX: ${dimens.startX} and startY: ${dimens.startY}`);

    const bounds = this.getSubGridBounds(map, gridCourse);

    const matrix = this.generateMatrixBetweenPoints(bounds, (gridX, gridY) => {
      const x = gridX + offset.gridOffsetX;
      const y = gridY + offset.gridOffsetY;
      return tree[y * dimens.width + x] === 1;
    });

    return { grid: new PF.Grid(matrix), startX: bounds.startX, startY: bounds.startY };
  }

  private getSubGridBounds(map: string, gridCourse: IGridCourse): IGridBounds {
    const { start, end, offset = 0 } = gridCourse;
    const mapDimens = this.mapProperties.getMapDimensions(map);

    const startX = Math.max(mapDimens.startX, Math.min(start.x, end.x) - offset);
    const startY = Math.max(mapDimens.startY, Math.min(start.y, end.y) - offset);
    const endX = Math.min(mapDimens.width + mapDimens.startX, Math.max(start.x, end.x) + offset + 1);
    const endY = Math.min(mapDimens.height + mapDimens.startY, Math.max(start.y, end.y) + offset + 1);

    return {
      startX,
      startY,
      width: endX - startX,
      height: endY - startY,
    };
  }

  private generateMatrixBetweenPoints(
    bounds: IGridBounds,
    isSolidFn: (gridX: number, gridY: number) => boolean
  ): number[][] {
    const matrix = new Uint8Array(bounds.width * bounds.height);

    for (let y = 0; y < bounds.height; y++) {
      for (let x = 0; x < bounds.width; x++) {
        matrix[y * bounds.width + x] = isSolidFn(x + bounds.startX, y + bounds.startY) ? 1 : 0;
      }
    }

    return Array.from({ length: bounds.height }, (_, i) =>
      Array.from(matrix.subarray(i * bounds.width, (i + 1) * bounds.width))
    );
  }
}
