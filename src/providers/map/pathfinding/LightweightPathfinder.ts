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
  isStuck?: boolean;
}

@provide(LightweightPathfinder)
export class LightweightPathfinder {
  private static readonly MAX_STATIONARY_COUNT = 5; // Maximum number of consecutive stationary checks

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
        const { npc, targetX, targetY } = job.data;

        const result = await this.executePathfindingQueue(npc, targetX, targetY);

        await this.resultsPoller.prepareResultToBePolled("lightweight-pathfinding", job.id!, result);
      },
      { npc, targetX, targetY },
      {
        queueScaleBy: "active-npcs",
      }
    );

    return this.resultsPoller.pollResults("lightweight-pathfinding", job?.id!);
  }

  private async executePathfindingQueue(npc: INPC, targetX: number, targetY: number): Promise<number[][]> {
    const potentialPositions = this.getPotentialPositions(npc);
    const nonSolidPositions = await this.getNonSolidPositions(npc, potentialPositions);

    if (nonSolidPositions.length === 0) return [];

    const bestPosition = this.getBestPosition(nonSolidPositions, targetX, targetY);

    if (bestPosition) {
      if (await this.isOscillatingOrStationary(npc, bestPosition.x, bestPosition.y)) {
        return this.handleAdvancedPathfinding(npc);
      }
      if (await this.handleNPCStuck(npc, bestPosition.x, bestPosition.y)) {
        return this.findAlternativePath(npc, nonSolidPositions, targetX, targetY);
      }
      return [[ToGridX(bestPosition.x), ToGridY(bestPosition.y)]];
    }

    return [];
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
    // Batch processing of positions to reduce asynchronous overhead
    const results = await Promise.all(
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
    );

    return results.filter((result) => !result.isSolid).map((result) => result.position);
  }

  private getBestPosition(nonSolidPositions: IPathPosition[], targetX: number, targetY: number): IPathPosition | null {
    const targetDirection = this.calculateTargetDirection(
      nonSolidPositions[0].x,
      nonSolidPositions[0].y,
      targetX,
      targetY
    );

    // eslint-disable-next-line mongoose-lean/require-lean
    const targetDirectionPosition = nonSolidPositions.find((pos) => pos.direction === targetDirection);
    if (targetDirectionPosition) return targetDirectionPosition;

    return this.getClosestPosition(nonSolidPositions, targetX, targetY);
  }

  private calculateTargetDirection(x: number, y: number, targetX: number, targetY: number): string {
    const dx = targetX - x;
    const dy = targetY - y;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";
  }

  private getClosestPosition(positions: IPathPosition[], targetX: number, targetY: number): IPathPosition {
    return positions.reduce(
      (closest, position) => {
        const distance = this.mathHelper.getDistanceBetweenPoints(position.x, position.y, targetX, targetY);
        return distance < closest.distance! ? { ...position, distance } : closest;
      },
      { distance: Infinity, direction: "", x: 0, y: 0 } as IPathPosition
    );
  }

  private async handleNPCStuck(npc: INPC, x: number, y: number): Promise<boolean> {
    const npcId = npc._id.toString();
    const prevPositions = (await this.inMemoryHashTable.get("npc-positions", npcId)) || [];
    const isStuck = prevPositions.some(([prevX, prevY]) => prevX === ToGridX(x) && prevY === ToGridY(y));

    prevPositions.push([ToGridX(x), ToGridY(y)]);
    if (prevPositions.length > 5) prevPositions.shift();
    await this.inMemoryHashTable.set("npc-positions", npcId, prevPositions);

    return isStuck;
  }

  private async findAlternativePath(
    npc: INPC,
    nonSolidPositions: IPathPosition[],
    targetX: number,
    targetY: number
  ): Promise<number[][]> {
    const alternativePositions = await Promise.all(
      nonSolidPositions.map(async (pos) => ({
        isStuck: await this.handleNPCStuck(npc, pos.x, pos.y),
        ...pos,
      }))
    );

    const validAlternatives = alternativePositions.filter((pos) => !pos.isStuck);

    if (validAlternatives.length > 0) {
      const bestAlternative = this.getClosestPosition(validAlternatives, targetX, targetY);
      return [[ToGridX(bestAlternative.x), ToGridY(bestAlternative.y)]];
    }

    return this.handleAdvancedPathfinding(npc);
  }

  private async isOscillatingOrStationary(npc: INPC, x: number, y: number): Promise<boolean> {
    const npcId = npc._id.toString();
    const prevPositions = (await this.inMemoryHashTable.get("npc-positions", npcId)) || [];
    const currentPos = [ToGridX(x), ToGridY(y)];

    const isOscillating =
      prevPositions.length >= 4 &&
      this.arePositionsEqual(currentPos, prevPositions[1]) &&
      this.arePositionsEqual(prevPositions[0], prevPositions[2]);

    if (isOscillating) return true;

    const stationaryCount = ((await this.inMemoryHashTable.get("npc-stationary-count", npcId)) || 0) as number;
    const prevPosition = (await this.inMemoryHashTable.get("npc-prev-position", npcId)) as number[];

    if (prevPosition && this.arePositionsEqual(currentPos, prevPosition)) {
      const newCount = stationaryCount + 1;
      await this.inMemoryHashTable.set("npc-stationary-count", npcId, newCount);
      return newCount >= LightweightPathfinder.MAX_STATIONARY_COUNT;
    } else {
      await this.inMemoryHashTable.set("npc-stationary-count", npcId, 0);
      await this.inMemoryHashTable.set("npc-prev-position", npcId, currentPos);
      return false;
    }
  }

  private arePositionsEqual(pos1: number[], pos2: number[]): boolean {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
  }

  private async handleAdvancedPathfinding(npc: INPC): Promise<number[][]> {
    await this.inMemoryHashTable.set("npc-force-pathfinding-calculation", npc._id, true);
    return [];
  }
}
