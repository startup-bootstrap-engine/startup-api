import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { MathHelper } from "@providers/math/MathHelper";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { GRID_WIDTH, ToGridX, ToGridY } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(LightweightPathfinder)
export class LightweightPathfinder {
  private static readonly MAX_STATIONARY_COUNT = 5;
  private static readonly MAX_OSCILLATION_COUNT = 2;
  private static readonly FORCE_ADVANCED_PATHFINDING_INTERVAL = 10;

  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private mathHelper: MathHelper,
    private movementHelper: MovementHelper
  ) {}

  @TrackNewRelicTransaction()
  public async calculateLightPathfinding(npc: INPC, targetX: number, targetY: number): Promise<number[][]> {
    const potentialPositions = [
      { direction: "top", x: npc.x, y: npc.y - GRID_WIDTH },
      { direction: "bottom", x: npc.x, y: npc.y + GRID_WIDTH },
      { direction: "left", x: npc.x - GRID_WIDTH, y: npc.y },
      { direction: "right", x: npc.x + GRID_WIDTH, y: npc.y },
    ];

    const nonSolidPositions = await this.getNonSolidPositions(npc, potentialPositions);

    if (nonSolidPositions.length === 0) {
      return this.handleAdvancedPathfinding(npc);
    }

    const dx = targetX - npc.x;
    const dy = targetY - npc.y;
    const targetDirection = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";

    const bestPosition = this.getBestPosition(nonSolidPositions, targetDirection, targetX, targetY);

    if (bestPosition) {
      if (await this.shouldTryAlternativePath(npc, bestPosition.x, bestPosition.y)) {
        const alternativePath = await this.findAlternativePath(npc, nonSolidPositions, targetX, targetY);
        if (alternativePath.length > 0) {
          return alternativePath;
        }
      }

      if (await this.shouldForceAdvancedPathfinding(npc, bestPosition.x, bestPosition.y)) {
        return this.handleAdvancedPathfinding(npc);
      }

      return [[ToGridX(bestPosition.x), ToGridY(bestPosition.y)]];
    }

    return this.handleAdvancedPathfinding(npc);
  }

  private async getNonSolidPositions(npc: INPC, potentialPositions: any[]): Promise<any[]> {
    return (
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
  }

  private getBestPosition(nonSolidPositions: any[], targetDirection: string, targetX: number, targetY: number): any {
    // eslint-disable-next-line mongoose-lean/require-lean
    const targetDirectionPosition = nonSolidPositions.find((pos) => pos.direction === targetDirection);
    if (targetDirectionPosition) {
      return targetDirectionPosition;
    }

    return this.getClosestPosition(nonSolidPositions, targetX, targetY);
  }

  private getClosestPosition(positions: any[], targetX: number, targetY: number): any {
    return positions.reduce(
      (closest, position) => {
        const distance = this.mathHelper.getDistanceBetweenPoints(position.x, position.y, targetX, targetY);
        return distance < closest.distance ? { ...position, distance } : closest;
      },
      { distance: Infinity, direction: "", x: 0, y: 0 }
    );
  }

  private async shouldTryAlternativePath(npc: INPC, x: number, y: number): Promise<boolean> {
    const npcId = npc._id.toString();
    const isOscillating = await this.isOscillating(npc, x, y);
    const isStationary = await this.isStationary(npc, x, y);
    const isStuck = await this.handleNPCStuck(npc, x, y);

    return isOscillating || isStationary || isStuck;
  }

  private async findAlternativePath(
    npc: INPC,
    nonSolidPositions: any[],
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

    return [];
  }

  private async shouldForceAdvancedPathfinding(npc: INPC, x: number, y: number): Promise<boolean> {
    const npcId = npc._id.toString();
    const moveCount = ((await this.inMemoryHashTable.get("npc-move-count", npcId)) || 0) as number;
    await this.inMemoryHashTable.set("npc-move-count", npcId, moveCount + 1);

    if (moveCount % LightweightPathfinder.FORCE_ADVANCED_PATHFINDING_INTERVAL === 0) {
      await this.inMemoryHashTable.set("npc-move-count", npcId, 0);
      return true;
    }

    return false;
  }

  private async handleNPCStuck(npc: INPC, x: number, y: number): Promise<boolean> {
    const npcId = npc._id.toString();
    const prevPositions = (await this.inMemoryHashTable.get("npc-positions", npcId)) || [];
    const isStuck = prevPositions.some(([prevX, prevY]) => prevX === ToGridX(x) && prevY === ToGridY(y));

    prevPositions.push([ToGridX(x), ToGridY(y)]);
    if (prevPositions.length > 5) {
      prevPositions.shift();
    }
    await this.inMemoryHashTable.set("npc-positions", npcId, prevPositions);

    return isStuck;
  }

  private async isOscillating(npc: INPC, x: number, y: number): Promise<boolean> {
    const npcId = npc._id.toString();
    const prevPositions = (await this.inMemoryHashTable.get("npc-positions", npcId)) || [];
    const oscillationCount = ((await this.inMemoryHashTable.get("npc-oscillation-count", npcId)) || 0) as number;

    const currentPos = [ToGridX(x), ToGridY(y)];
    prevPositions.push(currentPos);
    if (prevPositions.length > 4) {
      prevPositions.shift();
    }
    await this.inMemoryHashTable.set("npc-positions", npcId, prevPositions);

    if (prevPositions.length < 4) return false;

    const lastFourPositions = prevPositions.slice(-4);
    const isOscillating =
      this.arePositionsEqual(currentPos, lastFourPositions[1]) &&
      this.arePositionsEqual(lastFourPositions[0], lastFourPositions[2]);

    if (isOscillating) {
      await this.inMemoryHashTable.set("npc-oscillation-count", npcId, oscillationCount + 1);
      return oscillationCount + 1 >= LightweightPathfinder.MAX_OSCILLATION_COUNT;
    } else {
      await this.inMemoryHashTable.set("npc-oscillation-count", npcId, 0);
      return false;
    }
  }

  private async isStationary(npc: INPC, x: number, y: number): Promise<boolean> {
    const npcId = npc._id.toString();
    const stationaryCount = ((await this.inMemoryHashTable.get("npc-stationary-count", npcId)) || 0) as number;
    const prevPosition = (await this.inMemoryHashTable.get("npc-prev-position", npcId)) as number[];

    const currentPos = [ToGridX(x), ToGridY(y)];

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

  private async handleAdvancedPathfinding(npc: INPC): Promise<number[][]> {
    await this.inMemoryHashTable.set("npc-force-pathfinding-calculation", npc._id, true);
    return [];
  }

  private arePositionsEqual(pos1: number[], pos2: number[]): boolean {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
  }
}
