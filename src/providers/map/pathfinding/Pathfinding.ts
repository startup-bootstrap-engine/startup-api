import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { PATHFINDING_LIGHTWEIGHT_WALKABLE_THRESHOLD } from "@providers/constants/PathfindingConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MathHelper } from "@providers/math/MathHelper";
import { MessagingBroker } from "@providers/microservice/messaging-broker/MessagingBrokerMessaging";
import { AvailableMicroservices, MicroserviceRequest } from "@providers/microservice/MicroserviceRequest";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { FromGridX, FromGridY } from "@rpg-engine/shared";
import PF from "pathfinding";
import { GridManager, IGridCourse } from "../GridManager";
import { LightweightPathfinder } from "./LightweightPathfinder";

export interface IRPGPathfinderResponse {
  path: number[][];
  error?: string;
  npcId: string;
  offsetStartX: number;
  offsetStartY: number;
}

interface IRPGPathfinderRequestData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  grid: PF.Grid;
  npcId: string;
  offsetStartX: number;
  offsetStartY: number;
}

@provideSingleton(Pathfinding)
export class Pathfinding {
  constructor(
    private locker: Locker,
    private gridManager: GridManager,
    private lightweightPathfinder: LightweightPathfinder,
    private npcTarget: NPCTarget,
    private messagingBroker: MessagingBroker,
    private mathHelper: MathHelper,
    private microserviceRequest: MicroserviceRequest
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
    const canProceed = await this.locker.lock(`pathfinding-${npc._id}`);

    if (!canProceed) {
      return;
    }

    try {
      if (appEnv.general.IS_UNIT_TEST) {
        return this.getResultsFromPathfindingAlgorithm(npc, map, {
          start: { x: startGridX, y: startGridY },
          end: { x: endGridX, y: endGridY },
        });
      }

      const pathfindingResult = await this.getResultsFromPathfindingAlgorithm(npc, npc.scene, {
        start: { x: startGridX, y: startGridY },
        end: { x: endGridX, y: endGridY },
      });

      if (pathfindingResult && pathfindingResult?.length > 0) {
        return pathfindingResult;
      }

      await this.npcTarget.tryToSetTarget(npc);

      return await this.triggerLightweightPathfinding(npc, endGridX, endGridY);
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`pathfinding-${npc._id}`);
    }
  }

  public async requestShortestPathCalculation(
    npc: INPC,
    target: ICharacter | null,
    map: string,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`pathfinding-${npc._id}`);

      if (!canProceed) {
        return;
      }

      const gridCourse = {
        start: { x: startGridX, y: startGridY },
        end: { x: endGridX, y: endGridY },
      };

      const { grid, firstNode, lastNode, startX, startY } = this.prepareGridAndNodes(map, gridCourse);

      // Proceed to request pathfinding from service
      const data: IRPGPathfinderRequestData = {
        startX: firstNode.x,
        startY: firstNode.y,
        endX: lastNode.x,
        endY: lastNode.y,
        grid,
        npcId: npc._id,
        offsetStartX: startX,
        offsetStartY: startY,
      };

      await this.messagingBroker.sendMessage("rpg_pathfinding", "find_path", data);
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`pathfinding-${npc._id}`);
    }
  }

  private async triggerLightweightPathfinding(
    npc: INPC,
    endGridX: number,
    endGridY: number
  ): Promise<number[][] | undefined> {
    const nearestGridToTarget = await this.lightweightPathfinder.calculateLightPathfinding(
      npc,
      FromGridX(endGridX),
      FromGridY(endGridY)
    );

    if (nearestGridToTarget?.length) {
      return nearestGridToTarget;
    }

    return undefined;
  }

  private async getResultsFromPathfindingAlgorithm(
    npc: INPC,
    map: string,
    gridCourse: IGridCourse,
    retries = 0
  ): Promise<number[][]> {
    const { grid, firstNode, lastNode, startX, startY } = this.prepareGridAndNodes(map, gridCourse);

    let path: number[][];

    if (appEnv.general.IS_UNIT_TEST) {
      path = this.findPathInUnitTest(firstNode, lastNode, grid);
    } else {
      path = await this.findPathInProduction(npc, grid, gridCourse, firstNode, lastNode);
    }

    const pathWithOffset = this.applyOffsetToPath(path, startX, startY);

    if (this.shouldRetry(pathWithOffset, retries)) {
      gridCourse.offset = this.calculateNewOffset(retries);
      return await this.getResultsFromPathfindingAlgorithm(npc, map, gridCourse, retries + 1);
    }

    return pathWithOffset;
  }

  private prepareGridAndNodes(
    map: string,
    gridCourse: IGridCourse
  ): {
    grid: PF.Grid;
    firstNode: { x: number; y: number };
    lastNode: { x: number; y: number };
    startX: number;
    startY: number;
  } {
    const data = this.gridManager.generateGridBetweenPoints(map, gridCourse);
    const firstNode = { x: gridCourse.start.x - data.startX, y: gridCourse.start.y - data.startY };
    const lastNode = { x: gridCourse.end.x - data.startX, y: gridCourse.end.y - data.startY };

    data.grid.setWalkableAt(firstNode.x, firstNode.y, true);
    data.grid.setWalkableAt(lastNode.x, lastNode.y, true);

    return { grid: data.grid, firstNode, lastNode, startX: data.startX, startY: data.startY };
  }

  private findPathInUnitTest(
    firstNode: { x: number; y: number },
    lastNode: { x: number; y: number },
    grid: PF.Grid
  ): number[][] {
    const finder = new PF.BestFirstFinder();
    return finder.findPath(firstNode.x, firstNode.y, lastNode.x, lastNode.y, grid);
  }

  private async findPathInProduction(
    npc: INPC,
    grid: PF.Grid,
    gridCourse: IGridCourse,
    firstNode: { x: number; y: number },
    lastNode: { x: number; y: number }
  ): Promise<number[][]> {
    if (this.shouldUseLightweightPathfinding(grid, firstNode, gridCourse)) {
      const result = await this.triggerLightweightPathfinding(npc, gridCourse.end.x, gridCourse.end.y);
      if (result) {
        return result;
      }
    }

    return await this.requestPathfindingFromService(grid, firstNode, lastNode);
  }

  private shouldUseLightweightPathfinding(
    grid: PF.Grid,
    firstNode: { x: number; y: number },
    gridCourse: IGridCourse
  ): boolean {
    const isClear = this.isAreaClearOfSolids(grid, firstNode.x, firstNode.y);
    const isCloseToTarget = this.isCloseToTarget(gridCourse);
    return isClear || isCloseToTarget;
  }

  private async requestPathfindingFromService(
    grid: PF.Grid,
    firstNode: { x: number; y: number },
    lastNode: { x: number; y: number }
  ): Promise<number[][]> {
    const requestData = {
      startX: firstNode.x,
      startY: firstNode.y,
      endX: lastNode.x,
      endY: lastNode.y,
      grid,
    };

    try {
      const result = await this.microserviceRequest.request<IRPGPathfinderResponse>(
        AvailableMicroservices.RpgPathfinding,
        "/path",
        requestData
      );

      if (result?.error) {
        throw new Error(result.error);
      }

      return result.path;
    } catch (error) {
      console.error("Error in pathfinding:", error);
      throw error;
    }
  }

  public applyOffsetToPath(path: number[][], startX: number, startY: number): number[][] {
    return path.map(([x, y]) => [x + startX, y + startY]);
  }

  private shouldRetry(path: number[][], retries: number): boolean {
    return path.length < 1 && retries < 3;
  }

  private calculateNewOffset(retries: number): number {
    return Math.pow(10, retries + 1);
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
