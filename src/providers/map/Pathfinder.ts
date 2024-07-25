import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { MathHelper } from "@providers/math/MathHelper";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { GRID_WIDTH, ToGridX, ToGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import PF from "pathfinding";
import { GridManager, IGridCourse } from "./GridManager";
import { MapHelper } from "./MapHelper";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { LightweightPathfinder } from "./LightweightPathfinder";

@provide(Pathfinder)
export class Pathfinder {
  constructor(
    private mapHelper: MapHelper,
    private gridManager: GridManager,

    private npcTarget: NPCTarget,
    private lightweightPathfinder: LightweightPathfinder
  ) {}

  @TrackNewRelicTransaction()
  public async findShortestPath(
    npc: INPC,
    target: ICharacter | null,
    map: string,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<number[][] | undefined> {
    if (!this.mapHelper.areAllCoordinatesValid([startGridX, startGridY], [endGridX, endGridY])) {
      return;
    }

    const pathfindingResult = await this.findShortestPathBetweenPoints(map, {
      start: { x: startGridX, y: startGridY },
      end: { x: endGridX, y: endGridY },
    });

    // If a path is found, return it
    if (pathfindingResult && pathfindingResult.length > 0) {
      return pathfindingResult;
    }

    // If no target or path is found, attempt "dumb" pathfinding
    if (!target || !pathfindingResult || pathfindingResult.length === 0) {
      await this.npcTarget.tryToSetTarget(npc);

      const nearestGridToTarget = await this.lightweightPathfinder.getNearestGridToTarget(
        npc,
        ToGridX(endGridX),
        ToGridY(endGridY)
      );

      if (nearestGridToTarget?.length) {
        return nearestGridToTarget;
      }
    }

    // If all else fails, return undefined or an alternative path
    return undefined;
  }

  public async isTherePathBetweenPoints(
    map: string,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<boolean> {
    const path = await this.findShortestPathBetweenPoints(map, {
      start: { x: startGridX, y: startGridY },
      end: { x: endGridX, y: endGridY },
    });

    return path.length > 0;
  }

  @TrackNewRelicTransaction()
  private async findShortestPathBetweenPoints(map: string, gridCourse: IGridCourse, retries = 0): Promise<number[][]> {
    const data = this.gridManager.generateGridBetweenPoints(map, gridCourse);
    const grid = data.grid;

    const firstNode = { x: gridCourse.start.x - data.startX, y: gridCourse.start.y - data.startY };
    const lastNode = { x: gridCourse.end.x - data.startX, y: gridCourse.end.y - data.startY };

    grid.setWalkableAt(firstNode.x, firstNode.y, true);
    grid.setWalkableAt(lastNode.x, lastNode.y, true);

    const finder = appEnv.general.IS_UNIT_TEST ? new PF.BestFirstFinder() : new PF.BreadthFirstFinder();

    const path = finder.findPath(firstNode.x, firstNode.y, lastNode.x, lastNode.y, grid);
    const pathWithoutOffset = path.map(([x, y]) => [x + data.startX, y + data.startY]);

    if (pathWithoutOffset.length < 1 && retries < 3) {
      gridCourse.offset = Math.pow(10, retries + 1);
      return await this.findShortestPathBetweenPoints(map, gridCourse, retries + 1);
    }

    return pathWithoutOffset;
  }
}
