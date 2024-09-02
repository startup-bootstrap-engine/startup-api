import { PATHFINDING_LIGHTWEIGHT_WALKABLE_THRESHOLD } from "@providers/constants/PathfindingConstants";
import { MathHelper } from "@providers/math/MathHelper";
import { provide } from "inversify-binding-decorators";
import PF from "pathfinding";
import { IGridCourse } from "../GridManager";

@provide(PathfindingFallbackChecker)
export class PathfindingFallbackChecker {
  constructor(private mathHelper: MathHelper) {}

  public shouldUseLightweightPathfinding(
    grid: PF.Grid,
    firstNode: { x: number; y: number },
    gridCourse: IGridCourse
  ): boolean {
    const isClear = this.isAreaClearOfSolids(grid, firstNode.x, firstNode.y);
    const isCloseToTarget = this.isCloseToTarget(gridCourse);
    return isClear || isCloseToTarget;
  }

  // Helper method to check if the start and end points are close
  private isCloseToTarget(gridCourse: IGridCourse): boolean {
    const distance = this.mathHelper.getDistanceInGridCells(
      gridCourse.start.x,
      gridCourse.start.y,
      gridCourse.end.x,
      gridCourse.end.y
    );
    return distance <= 3;
  }

  private isAreaClearOfSolids(grid: PF.Grid, x: number, y: number, radius: number = 1): boolean {
    let walkableTiles = 0;
    let totalTiles = 0;

    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        const tileX = x + i;
        const tileY = y + j;

        // Check if within grid bounds
        if (tileX >= 0 && tileX < grid.width && tileY >= 0 && tileY < grid.height) {
          totalTiles++;
          if (grid.isWalkableAt(tileX, tileY)) {
            walkableTiles++;
          }
        }
      }
    }

    // Calculate the percentage of walkable tiles
    const walkablePercentage = (walkableTiles / totalTiles) * 100;

    return walkablePercentage >= PATHFINDING_LIGHTWEIGHT_WALKABLE_THRESHOLD;
  }
}
