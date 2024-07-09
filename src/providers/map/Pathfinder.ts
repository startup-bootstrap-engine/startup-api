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

@provide(Pathfinder)
export class Pathfinder {
  constructor(
    private mapHelper: MapHelper,
    private inMemoryHashTable: InMemoryHashTable,
    private gridManager: GridManager,
    private mathHelper: MathHelper,
    private movementHelper: MovementHelper
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

    if (!target) {
      return await this.findShortestPathBetweenPoints(map, {
        start: { x: startGridX, y: startGridY },
        end: { x: endGridX, y: endGridY },
      });
    }

    //! Dump pathfinding to save resources
    // const isUnderRange = this.movementHelper.isUnderRange(npc.x, npc.y, target.x, target.y, 5);

    // if (isUnderRange) {
    //   const nearestGridToTarget = await this.getNearestGridToTarget(npc, target.x, target.y, [
    //     ToGridX(npc.x),
    //     ToGridY(npc.y),
    //   ]);

    //   if (nearestGridToTarget?.length) {
    //     return nearestGridToTarget;
    //   }
    // }

    return await this.findShortestPathBetweenPoints(map, {
      start: { x: startGridX, y: startGridY },
      end: { x: endGridX, y: endGridY },
    });
  }

  //! Simplified pathfinding calculation
  private async getNearestGridToTarget(
    npc: INPC,
    targetX: number,
    targetY: number,
    previousNPCPosition: number[]
  ): Promise<number[][]> {
    const potentialPositions = [
      { direction: "top", x: npc.x, y: npc.y - GRID_WIDTH },
      { direction: "bottom", x: npc.x, y: npc.y + GRID_WIDTH },
      { direction: "left", x: npc.x - GRID_WIDTH, y: npc.y },
      { direction: "right", x: npc.x + GRID_WIDTH, y: npc.y },
    ];

    const nonSolidPositions = (
      await Promise.all(
        potentialPositions.map(async (position) => ({
          isSolid: await this.movementHelper.isSolid(
            npc.scene,
            ToGridX(position.x),
            ToGridY(position.y),
            npc.layer,
            "CHECK_ALL_LAYERS_BELOW"
          ),
          position,
        }))
      )
    )
      .filter((result) => !result.isSolid)
      .map((result) => result.position);

    const dx = targetX - npc.x;
    const dy = targetY - npc.y;
    const targetDirection = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";

    const handleNPCStuck = async (x: number, y: number): Promise<boolean> => {
      if (previousNPCPosition && ToGridX(x) === previousNPCPosition[0] && ToGridY(y) === previousNPCPosition[1]) {
        await this.inMemoryHashTable.set("npc-force-pathfinding-calculation", npc._id, true);
        return true;
      }
      return false;
    };

    // eslint-disable-next-line mongoose-lean/require-lean
    const targetDirectionPosition = nonSolidPositions.find((pos) => pos.direction === targetDirection);

    if (targetDirectionPosition) {
      if (await handleNPCStuck(targetDirectionPosition.x, targetDirectionPosition.y)) {
        return [];
      }
      return [[ToGridX(targetDirectionPosition.x), ToGridY(targetDirectionPosition.y)]];
    }

    type PositionWithDistance = { distance: number; direction: string; x: number; y: number };

    const closestPosition = nonSolidPositions.reduce<PositionWithDistance>(
      (closest, position) => {
        const distance = this.mathHelper.getDistanceBetweenPoints(position.x, position.y, targetX, targetY);
        return distance < closest.distance ? { ...position, distance } : closest;
      },
      { distance: Infinity, direction: "", x: 0, y: 0 }
    );

    if (closestPosition.distance < Infinity) {
      if (await handleNPCStuck(closestPosition.x, closestPosition.y)) {
        return [];
      }
      return [[ToGridX(closestPosition.x), ToGridY(closestPosition.y)]];
    }

    return [];
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
