import { MapLayers } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import PF from "pathfinding";
import { MapHelper } from "./MapHelper";
import { MapSolids } from "./MapSolids";
import { MapTiles } from "./MapTiles";
import { GridRedisSerializer } from "./grid/GridRedisSerializer";

@provide(GridManager)
export class GridManager {
  constructor(
    private mapTiles: MapTiles,
    private mapSolids: MapSolids,
    private mapHelper: MapHelper,
    private gridRedisSerializer: GridRedisSerializer
  ) {}

  public async getGrid(map: string): Promise<PF.Grid> {
    const matrix = await this.gridRedisSerializer.getMatrixFromRedis(map);

    if (!matrix) {
      throw new Error("❌Could not find matrix for map: " + map);
    }

    const grid = new PF.Grid(matrix);

    return grid;
  }

  public async hasGrid(map: string): Promise<boolean> {
    const grid = await this.getGrid(map);

    return !!grid;
  }

  public async generateGridSolids(map: string): Promise<void> {
    const { gridOffsetX, gridOffsetY } = this.getMapOffset(map)!;

    const { width, height } = this.mapTiles.getMapWidthHeight(map, gridOffsetX, gridOffsetY);

    const matrix: number[][] = [];

    for (let gridY = 0; gridY < height; gridY++) {
      for (let gridX = 0; gridX < width; gridX++) {
        matrix[gridY] = matrix[gridY] || [];

        // isTileSolid will get the ge_collide property directly from the json file, thats why we should use "raw coordinates", in other words, we should subtract the tileset!
        const isSolid = this.mapSolids.isTileSolid(map, gridX - gridOffsetX, gridY - gridOffsetY, MapLayers.Character);
        const isPassage = this.mapSolids.isTilePassage(
          map,
          gridX - gridOffsetX,
          gridY - gridOffsetY,
          MapLayers.Character
        );
        const isWalkable = !isSolid || isPassage;
        matrix[gridY][gridX] = isWalkable ? 0 : 1;
      }
    }

    await this.gridRedisSerializer.saveMatrixToRedis(map, matrix);
  }

  public async isWalkable(map: string, gridX: number, gridY: number): Promise<boolean | undefined> {
    const { gridOffsetX, gridOffsetY } = this.getMapOffset(map)!;

    const offsetGridX = gridX + gridOffsetX;
    const offsetGridY = gridY + gridOffsetY;

    try {
      const grid = await this.getGrid(map);

      if (!grid) {
        throw new Error("❌Could not find grid for map: " + map);
      }

      return grid.isWalkableAt(offsetGridX, offsetGridY);
    } catch (error) {
      console.log(
        `Failed to check isWalkable for gridX ${gridX}, gridY ${gridY} (offsetGrid: ${offsetGridX}, ${offsetGridY}) on map ${map}. Offset is: ${gridOffsetX}, ${gridOffsetY}`
      );
      console.error(error);
    }
  }

  public async setWalkable(map: string, gridX: number, gridY: number, walkable: boolean): Promise<void> {
    try {
      const grid = await this.getGrid(map);

      if (!grid) {
        throw new Error("❌Could not find grid for map: " + map);
      }

      grid.setWalkableAt(gridX, gridY, walkable);
    } catch (error) {
      console.log(`Failed to setWalkable=${walkable} for gridX ${gridX}, gridY ${gridY} on map ${map}`);
      console.error(error);
    }
  }

  public getMapOffset(map: string): { gridOffsetX: number; gridOffsetY: number } | undefined {
    const initialXY = this.mapTiles.getFirstXY(map, MapLayers.Ground);

    if (!initialXY) {
      console.log(`❌ Failed to get first XY for ${map}`);
      return;
    }
    const initialX = initialXY[0];
    const initialY = initialXY[1];

    let gridOffsetX = 0;
    let gridOffsetY = 0;

    if (initialX < 0) {
      gridOffsetX = Math.abs(initialX);
    }
    if (initialY < 0) {
      gridOffsetY = Math.abs(initialY);
    }

    return {
      gridOffsetX,
      gridOffsetY,
    };
  }

  public async findShortestPath(
    map: string,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<number[][] | undefined> {
    // Check if grid exists for the given map
    const gridMap = await this.getGrid(map);
    if (!gridMap) {
      throw new Error(`❌ Could not find grid for map: ${map}`);
    }

    // Clone the grid to avoid modifying the original
    const tempGrid = gridMap.clone();
    if (!tempGrid) {
      throw new Error(`❌ Could not clone grid for map: ${map}`);
    }

    // Use A* pathfinding algorithm to find shortest path
    const finder = new PF.AStarFinder();

    // Remap path without grid offset
    const { gridOffsetX, gridOffsetY } = this.getMapOffset(map)!;
    const startX = startGridX + (gridOffsetX ?? 0);
    const startY = startGridY + (gridOffsetY ?? 0);
    const endX = endGridX + (gridOffsetX ?? 0);
    const endY = endGridY + (gridOffsetY ?? 0);

    if (!this.mapHelper.areAllCoordinatesValid([startX, startY], [endX, endY])) {
      return;
    }

    // Set start and end points to walkable in temporary grid
    tempGrid.setWalkableAt(startX, startY, true);
    tempGrid.setWalkableAt(endX, endY, true);

    const path = finder.findPath(
      startGridX + gridOffsetX,
      startGridY + gridOffsetY,
      endGridX + gridOffsetX,
      endGridY + gridOffsetY,
      tempGrid
    );

    const newPath = path.map(([x, y]) => [x - (gridOffsetX ?? 0), y - (gridOffsetY ?? 0)]);

    return newPath;
  }
}
