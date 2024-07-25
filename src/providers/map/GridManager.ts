import { provideSingleton } from "@providers/inversify/provideSingleton";
import { MapLayers } from "@rpg-engine/shared";
import PF from "pathfinding";
import { MapSolids } from "./MapSolids";
import { MapGridSolidsStorage } from "./storage/MapGridSolidsStorage";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import mapVersions from "../../../public/config/map-versions.json";
import { MapProperties } from "./MapProperties";

interface IGridPoint {
  x: number;
  y: number;
}

interface IGridCourse {
  start: IGridPoint;
  end: IGridPoint;
  offset?: number;
}

interface IGridBounds {
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
  private grids: Map<string, number[][]> = new Map();

  constructor(
    private mapSolids: MapSolids,
    private mapGridSolidsStorage: MapGridSolidsStorage,
    private mapProperties: MapProperties
  ) {}

  public getGrid(map: string): number[][] | undefined {
    return this.grids.get(map);
  }

  public hasGrid(map: string): boolean {
    return this.grids.has(map);
  }

  @TrackNewRelicTransaction()
  public async generateGridSolids(map: string): Promise<void> {
    const bounds = this.mapProperties.getMapDimensions(map, true);
    const offset = this.mapProperties.getMapOffset(bounds.startX, bounds.startY)!;
    const currentMapVersion = mapVersions[map];

    if (await this.isStoredGridValid(map, currentMapVersion)) {
      return;
    }

    await this.mapGridSolidsStorage.deleteGridSolids(map);
    const tree = this.createGridTree(map, bounds, offset);
    await this.mapGridSolidsStorage.setGridSolids(map, tree);
    this.grids.set(map, tree);
  }

  private async isStoredGridValid(map: string, currentMapVersion: string): Promise<boolean> {
    const storedMapVersion = await this.mapGridSolidsStorage.getGridSolidsVersion(map);
    if (storedMapVersion && storedMapVersion === currentMapVersion) {
      const tree = await this.mapGridSolidsStorage.getGridSolids(map);
      if (!tree) {
        console.warn(`Grid version found but grid data missing for map: ${map}`);
        return false;
      }
      this.grids.set(map, tree);
      return true;
    }
    return false;
  }

  private createGridTree(
    map: string,
    bounds: IGridBounds,
    offset: { gridOffsetX: number; gridOffsetY: number }
  ): number[][] {
    const tree: number[][] = [];
    for (let gridY = bounds.startY; gridY < bounds.height; gridY++) {
      for (let gridX = bounds.startX; gridX < bounds.width; gridX++) {
        const isWalkable = this.isTileWalkable(map, gridX, gridY);
        const offsetX = gridX + offset.gridOffsetX;
        const offsetY = gridY + offset.gridOffsetY;
        if (!tree[offsetY]) {
          tree[offsetY] = [];
        }
        tree[offsetY][offsetX] = isWalkable ? 0 : 1;
      }
    }
    return tree;
  }

  private isTileWalkable(map: string, gridX: number, gridY: number): boolean {
    const isSolid = this.mapSolids.isTileSolid(map, gridX, gridY, MapLayers.Character);
    const isPassage = this.mapSolids.isTilePassage(map, gridX, gridY, MapLayers.Character);
    return !isSolid || isPassage;
  }

  @TrackNewRelicTransaction()
  public async isWalkable(map: string, gridX: number, gridY: number): Promise<boolean | undefined> {
    try {
      const grid = await this.getGrid(map);
      if (!grid) {
        throw new Error(`Could not find grid for map: ${map}`);
      }
      const bounds = this.mapProperties.getMapDimensions(map);
      const offset = this.mapProperties.getMapOffset(bounds.startX, bounds.startY)!;
      return grid[gridY + offset.gridOffsetY][gridX + offset.gridOffsetX] === 0;
    } catch (error) {
      console.error(`Failed to check isWalkable for gridX ${gridX}, gridY ${gridY}:`, error);
    }
  }

  public async setWalkable(map: string, gridX: number, gridY: number, walkable: boolean): Promise<void> {
    try {
      const grid = await this.getGrid(map);
      if (!grid) {
        throw new Error(`Could not find grid for map: ${map}`);
      }
      const bounds = this.mapProperties.getMapDimensions(map);
      const offset = this.mapProperties.getMapOffset(bounds.startX, bounds.startY)!;
      grid[gridY + offset.gridOffsetY][gridX + offset.gridOffsetX] = walkable ? 0 : 1;
      // TODO: Implement persistence of changes to Redis
    } catch (error) {
      console.error(`Failed to setWalkable=${walkable} for gridX ${gridX}, gridY ${gridY} on map ${map}:`, error);
    }
  }

  public generateGridBetweenPoints(map: string, gridCourse: IGridCourse): IGridBetweenPoints {
    const tree = this.getGrid(map);
    if (!tree || tree.length === 0) {
      throw new Error(`The tree is empty or not defined for map: ${map}`);
    }

    const dimens = this.mapProperties.getMapDimensions(map);
    const offset = this.mapProperties.getMapOffset(dimens.startX, dimens.startY)!;
    if (!offset) {
      throw new Error(`Offset is not defined for startX: ${dimens.startX} and startY: ${dimens.startY}`);
    }

    const bounds = this.getSubGridBounds(map, gridCourse);
    const solids = this.getSolidsSet(tree, bounds, offset);
    const matrix = this.generateMatrixBetweenPoints(bounds, (x, y) =>
      solids.has(`${x + offset.gridOffsetX}-${y + offset.gridOffsetY}`)
    );

    return { grid: new PF.Grid(matrix), startX: bounds.startX, startY: bounds.startY };
  }

  private getSubGridBounds(map: string, gridCourse: IGridCourse): IGridBounds {
    const { start, end, offset = 0 } = gridCourse;
    let startX = Math.min(start.x, end.x);
    let startY = Math.min(start.y, end.y);
    let width = Math.abs(end.x - start.x) + 1;
    let height = Math.abs(end.y - start.y) + 1;

    if (offset > 0) {
      const mapDimens = this.mapProperties.getMapDimensions(map);
      const { startX: minGridX, startY: minGridY, width: maxGridX, height: maxGridY } = mapDimens;

      startX = Math.max(startX - offset, minGridX);
      startY = Math.max(startY - offset, minGridY);

      const availableWidth = maxGridX - startX;
      const availableHeight = maxGridY - startY;

      width = Math.min(width + offset * 2, availableWidth);
      height = Math.min(height + offset * 2, availableHeight);
    }

    return { startX, startY, height, width };
  }

  private getSolidsSet(
    tree: number[][],
    bounds: IGridBounds,
    offset: { gridOffsetX: number; gridOffsetY: number }
  ): Set<string> {
    const solids = new Set<string>();
    for (let y = bounds.startY + offset.gridOffsetY; y < bounds.startY + bounds.height + offset.gridOffsetY; y++) {
      for (let x = bounds.startX + offset.gridOffsetX; x < bounds.startX + bounds.width + offset.gridOffsetX; x++) {
        if (tree[y] && tree[y][x] === 1) {
          solids.add(`${x}-${y}`);
        }
      }
    }
    return solids;
  }

  private generateMatrixBetweenPoints(
    bounds: IGridBounds,
    isSolidFn: (gridX: number, gridY: number) => boolean
  ): number[][] {
    const matrix: number[][] = [];

    for (let gridY = 0; gridY < bounds.height; gridY++) {
      const row: number[] = [];
      for (let gridX = 0; gridX < bounds.width; gridX++) {
        const isWalkable = !isSolidFn(gridX + bounds.startX, gridY + bounds.startY);
        row.push(isWalkable ? 0 : 1);
      }
      matrix.push(row);
    }

    if (matrix.length === 0) {
      throw new Error("Failed to generate pathfinding grid");
    }

    return matrix;
  }
}
