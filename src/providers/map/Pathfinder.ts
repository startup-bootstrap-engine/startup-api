import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { FromGridX, FromGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import PF from "pathfinding";
import { GridManager, IGridCourse } from "./GridManager";
import { LightweightPathfinder } from "./LightweightPathfinder";
import { MapHelper } from "./MapHelper";

@provide(Pathfinder)
export class Pathfinder {
  constructor(
    private mapHelper: MapHelper,
    private gridManager: GridManager,

    private npcTarget: NPCTarget,
    private lightweightPathfinder: LightweightPathfinder,
    private inMemoryHashTable: InMemoryHashTable
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
    if (appEnv.general.IS_UNIT_TEST) {
      return await this.findShortestPathBetweenPoints(map, {
        start: { x: startGridX, y: startGridY },
        end: { x: endGridX, y: endGridY },
      });
    }

    const forcePathfinding = await this.inMemoryHashTable.get("npc-force-pathfinding-calculation", npc._id);

    if (forcePathfinding) {
      const pathfindingResult = await this.findShortestPathBetweenPoints(map, {
        start: { x: startGridX, y: startGridY },
        end: { x: endGridX, y: endGridY },
      });

      // If a path is found, return it
      if (pathfindingResult && pathfindingResult.length > 0) {
        return pathfindingResult;
      }
    }

    const nearestGridToTarget = await this.lightweightPathfinder.getNearestGridToTarget(
      npc,
      FromGridX(endGridX),
      FromGridY(endGridY)
    );

    if (nearestGridToTarget?.length) {
      return nearestGridToTarget;
    }
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
