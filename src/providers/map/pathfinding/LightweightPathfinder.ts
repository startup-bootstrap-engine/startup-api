import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { MathHelper } from "@providers/math/MathHelper";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { GRID_WIDTH, ToGridX, ToGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

interface IPathPosition {
  direction: string;
  x: number;
  y: number;
  distance?: number;
}

export interface ILightweightPathfinderResponse {
  npcId: string;
  targetX: number;
  targetY: number;
}

@provide(LightweightPathfinder)
export class LightweightPathfinder {
  private static readonly MAX_STATIONARY_COUNT = 5;

  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private mathHelper: MathHelper,
    private movementHelper: MovementHelper,
    private dynamicQueue: DynamicQueue,
    private resultsPoller: ResultsPoller
  ) {}

  @TrackNewRelicTransaction()
  public async calculateLightPathfinding(npc: INPC, targetX: number, targetY: number): Promise<number[][]> {
    if (appEnv.general.IS_UNIT_TEST) {
      return await this.executePathfindingQueue(npc, targetX, targetY);
    }

    const job = await this.dynamicQueue.addJob(
      "lightweight-pathfinding",
      async (job) => {
        const result = await this.executePathfindingQueue(job.data.npc, job.data.targetX, job.data.targetY);
        await this.resultsPoller.prepareResultToBePolled("lightweight-pathfinding", job.id!, result);
      },
      { npc, targetX, targetY },
      { queueScaleBy: "active-npcs" }
    );

    return this.resultsPoller.pollResults("lightweight-pathfinding", job?.id!);
  }

  private async executePathfindingQueue(npc: INPC, targetX: number, targetY: number): Promise<number[][]> {
    const nonSolidPositions = await this.getNonSolidPositions(npc, this.getPotentialPositions(npc));

    if (nonSolidPositions.length === 0) return [];

    const bestPosition = this.getBestPosition(nonSolidPositions, targetX, targetY);

    if (bestPosition && !(await this.isStuckOrOscillating(npc, bestPosition))) {
      return [[ToGridX(bestPosition.x), ToGridY(bestPosition.y)]];
    }

    return this.findAlternativePath(npc, nonSolidPositions, targetX, targetY);
  }

  private getPotentialPositions(npc: INPC): IPathPosition[] {
    return [
      { direction: "top", x: npc.x, y: npc.y - GRID_WIDTH },
      { direction: "bottom", x: npc.x, y: npc.y + GRID_WIDTH },
      { direction: "left", x: npc.x - GRID_WIDTH, y: npc.y },
      { direction: "right", x: npc.x + GRID_WIDTH, y: npc.y },
    ];
  }

  private async getNonSolidPositions(npc: INPC, potentialPositions: IPathPosition[]): Promise<IPathPosition[]> {
    const checks = potentialPositions.map(async (position) => {
      const isSolid = await this.movementHelper.isSolid(
        npc.scene,
        ToGridX(position.x),
        ToGridY(position.y),
        npc.layer,
        "CHECK_ALL_LAYERS_BELOW"
      );
      return { ...position, isSolid };
    });

    const results = await Promise.all(checks);
    return results.filter((pos) => !pos.isSolid);
  }

  private getBestPosition(positions: IPathPosition[], targetX: number, targetY: number): IPathPosition | null {
    const targetDirection = this.calculateTargetDirection(positions[0].x, positions[0].y, targetX, targetY);
    // eslint-disable-next-line mongoose-lean/require-lean
    const directionMatch = positions.find((pos) => pos.direction === targetDirection);
    return directionMatch || this.getClosestPosition(positions, targetX, targetY);
  }

  private calculateTargetDirection(x: number, y: number, targetX: number, targetY: number): string {
    const dx = targetX - x;
    const dy = targetY - y;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";
  }

  private getClosestPosition(positions: IPathPosition[], targetX: number, targetY: number): IPathPosition {
    return positions.reduce((closest, position) => {
      const distance = this.mathHelper.getDistanceBetweenPoints(position.x, position.y, targetX, targetY);
      return !closest || distance < closest.distance! ? { ...position, distance } : closest;
    }, null as IPathPosition | null)!;
  }

  private async isStuckOrOscillating(npc: INPC, position: IPathPosition): Promise<boolean> {
    const currentPos = [ToGridX(position.x), ToGridY(position.y)];
    const npcId = npc._id.toString();
    const prevPositions = ((await this.inMemoryHashTable.get("npc-positions", npcId)) as number[][]) || [];

    if (prevPositions.some(([x, y]) => x === currentPos[0] && y === currentPos[1])) return true;

    prevPositions.push(currentPos);
    if (prevPositions.length > 5) prevPositions.shift();

    await this.inMemoryHashTable.set("npc-positions", npcId, prevPositions);

    if (prevPositions.length >= 4 && this.isOscillating(prevPositions)) return true;

    const stationaryCount = ((await this.inMemoryHashTable.get("npc-stationary-count", npcId)) || 0) as number;
    const prevPosition = prevPositions[prevPositions.length - 2];

    if (prevPosition && this.arePositionsEqual(currentPos, prevPosition)) {
      const newCount = stationaryCount + 1;
      await this.inMemoryHashTable.set("npc-stationary-count", npcId, newCount);
      return newCount >= LightweightPathfinder.MAX_STATIONARY_COUNT;
    }

    await this.inMemoryHashTable.set("npc-stationary-count", npcId, 0);
    return false;
  }

  private isOscillating(positions: number[][]): boolean {
    return (
      this.arePositionsEqual(positions[positions.length - 1], positions[positions.length - 3]) &&
      this.arePositionsEqual(positions[positions.length - 2], positions[positions.length - 4])
    );
  }

  private async findAlternativePath(
    npc: INPC,
    nonSolidPositions: IPathPosition[],
    targetX: number,
    targetY: number
  ): Promise<number[][]> {
    const validAlternatives = (
      await Promise.all(
        nonSolidPositions.map(async (pos) => ({
          ...pos,
          isStuck: await this.isStuckOrOscillating(npc, pos),
        }))
      )
    ).filter((pos) => !pos.isStuck);

    if (validAlternatives.length > 0) {
      const bestAlternative = this.getClosestPosition(validAlternatives, targetX, targetY);
      return [[ToGridX(bestAlternative.x), ToGridY(bestAlternative.y)]];
    }

    return this.handleAdvancedPathfinding(npc, targetX, targetY);
  }

  private arePositionsEqual(pos1: number[], pos2: number[]): boolean {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
  }

  private async handleAdvancedPathfinding(npc: INPC, targetX: number, targetY: number): Promise<number[][]> {
    const distanceToTarget = this.mathHelper.getDistanceInGridCells(npc.x, npc.y, targetX, targetY);

    if (distanceToTarget > 7) {
      return [];
    }

    await this.inMemoryHashTable.set("npc-force-pathfinding-calculation", npc._id, true);
    return [];
  }
}
