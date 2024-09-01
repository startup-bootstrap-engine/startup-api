import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { PATHFINDING_LIGHTWEIGHT_WALKABLE_THRESHOLD } from "@providers/constants/PathfindingConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MathHelper } from "@providers/math/MathHelper";
import { MicroserviceMessaging } from "@providers/microservice/MicroserviceMessaging";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { FromGridX, FromGridY } from "@rpg-engine/shared";
import { Job } from "bullmq";
import dayjs from "dayjs";
import PF from "pathfinding";
import { GridManager, IGridCourse } from "../GridManager";
import { LightweightPathfinder } from "./LightweightPathfinder";

interface IRPGPathfinderResponse {
  path: number[][];
  error?: string;
}

@provideSingleton(PathfindingQueue)
export class PathfindingQueue {
  constructor(
    private locker: Locker,
    private dynamicQueue: DynamicQueue,
    private resultsPoller: ResultsPoller,
    private gridManager: GridManager,
    private lightweightPathfinder: LightweightPathfinder,
    private npcTarget: NPCTarget,
    private microserviceMessaging: MicroserviceMessaging,
    private inMemoryHashTable: InMemoryHashTable,

    private mathHelper: MathHelper
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

      const cacheKey = `${npc._id}-${startGridX}-${startGridY}-${endGridX}-${endGridY}`;
      const cachedData = (await this.inMemoryHashTable.get("pathfinding-cache", cacheKey)) as {
        path: number[][];
        expiration: string;
      } | null;

      if (cachedData) {
        if (dayjs().isBefore(dayjs(cachedData.expiration))) {
          return cachedData.path;
        } else {
          // Clear expired cache entry
          await this.inMemoryHashTable.delete("pathfinding-cache", cacheKey);
        }
      }

      const pathfindingResult = await this.getResultsFromPathfindingAlgorithm(npc, npc.scene, {
        start: { x: startGridX, y: startGridY },
        end: { x: endGridX, y: endGridY },
      });

      if (pathfindingResult && pathfindingResult?.length > 0) {
        const expirationDate = dayjs().add(1, "day").toISOString();
        await this.inMemoryHashTable.set("pathfinding-cache", cacheKey, {
          path: pathfindingResult,
          expiration: expirationDate,
        });
        return pathfindingResult;
      }

      await this.npcTarget.tryToSetTarget(npc);

      return await this.triggerLightweightPathfinding(npc, endGridX, endGridY);

      // const pathfindingResult = await this.startPathfindingQueue(
      //   npc,
      //   target,
      //   startGridX,
      //   startGridY,
      //   endGridX,
      //   endGridY
      // );

      // if (pathfindingResult && pathfindingResult?.length > 0) {
      //   return pathfindingResult;
      // }

      // await this.npcTarget.tryToSetTarget(npc);

      // return await this.triggerLightweightPathfinding(npc, endGridX, endGridY);
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`pathfinding-${npc._id}`);
    }
  }

  @TrackNewRelicTransaction()
  public async startPathfindingQueue(
    npc: INPC,
    target: ICharacter | null,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<number[][] | undefined> {
    try {
      const job = await this.addPathfindingJob(npc, target, startGridX, startGridY, endGridX, endGridY);
      if (!job) {
        return;
      }

      const result = await this.resultsPoller.pollResults(
        "pathfinding",
        `pathfinding-${npc._id}-${startGridX}-${startGridY}-${endGridX}-${endGridY}`
      );

      return result;
    } catch (error) {
      console.error(error);
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

  private async addPathfindingJob(
    npc: INPC,
    target: ICharacter | null,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<Job | undefined> {
    try {
      return await this.dynamicQueue.addJob(
        "npc-pathfinding-queue",
        async (job) => {
          const { npc, startGridX, startGridY, endGridX, endGridY } = job.data;

          const path = await this.getResultsFromPathfindingAlgorithm(npc, npc.scene, {
            start: { x: startGridX, y: startGridY },
            end: { x: endGridX, y: endGridY },
          });

          await this.resultsPoller.prepareResultToBePolled(
            "pathfinding",
            `pathfinding-${npc._id}-${startGridX}-${startGridY}-${endGridX}-${endGridY}`,
            path?.length > 0 ? path : false
          );
        },
        {
          npc,
          startGridX,
          startGridY,
          endGridX,
          endGridY,
        }
      );
    } catch (error) {
      console.error(error);
    }

    return undefined;
  }

  private async getResultsFromPathfindingAlgorithm(
    npc: INPC,
    map: string,
    gridCourse: IGridCourse,
    retries = 0
  ): Promise<number[][]> {
    const data = this.gridManager.generateGridBetweenPoints(map, gridCourse);
    const grid = data.grid;

    const firstNode = { x: gridCourse.start.x - data.startX, y: gridCourse.start.y - data.startY };
    const lastNode = { x: gridCourse.end.x - data.startX, y: gridCourse.end.y - data.startY };

    grid.setWalkableAt(firstNode.x, firstNode.y, true);
    grid.setWalkableAt(lastNode.x, lastNode.y, true);

    let path: number[][];

    if (appEnv.general.IS_UNIT_TEST) {
      const finder = new PF.BestFirstFinder();
      path = finder.findPath(firstNode.x, firstNode.y, lastNode.x, lastNode.y, grid);
    } else {
      // Check if the surrounding area is clear
      const isClear = this.isAreaClearOfSolids(grid, firstNode.x, firstNode.y);

      const isCloseToTarget = this.isCloseToTarget(gridCourse);

      if (isClear || isCloseToTarget) {
        const result = await this.triggerLightweightPathfinding(npc, gridCourse.end.x, gridCourse.end.y);

        if (result) {
          return result;
        }
      }

      const requestData = {
        startX: firstNode.x,
        startY: firstNode.y,
        endX: lastNode.x,
        endY: lastNode.y,
        grid,
      };

      try {
        const result = await this.microserviceMessaging.sendAndWaitForResponse<
          typeof requestData,
          IRPGPathfinderResponse
        >("rpg_pathfinding", "find_path", "rpg_pathfinding", "path_result", requestData);

        if ("error" in result && result.error) {
          throw new Error(result.error);
        }
        return result.path;
      } catch (error) {
        console.error("Error in pathfinding:", error);
        throw error;
      }
    }

    const pathWithoutOffset = path.map(([x, y]) => [x + data.startX, y + data.startY]);

    if (pathWithoutOffset.length < 1 && retries < 3) {
      gridCourse.offset = Math.pow(10, retries + 1);
      return await this.getResultsFromPathfindingAlgorithm(npc, map, gridCourse, retries + 1);
    }

    return pathWithoutOffset;
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

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }
}
