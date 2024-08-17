import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { AvailableMicroservices, MicroserviceRequest } from "@providers/microservice/MicroserviceRequest";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { FromGridX, FromGridY } from "@rpg-engine/shared";
import { Job } from "bullmq";
import PF from "pathfinding";
import { GridManager, IGridCourse } from "../GridManager";
import { LightweightPathfinder } from "./LightweightPathfinder";

interface IRPGPathfinderResponse {
  path: number[][];
}

@provideSingleton(PathfindingQueue)
export class PathfindingQueue {
  constructor(
    private locker: Locker,
    private dynamicQueue: DynamicQueue,
    private resultsPoller: ResultsPoller,
    private gridManager: GridManager,
    private lightweightPathfinder: LightweightPathfinder,
    private inMemoryHashTable: InMemoryHashTable,
    private npcTarget: NPCTarget,
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
        return this.getResultsFromPathfindingAlgorithm(map, {
          start: { x: startGridX, y: startGridY },
          end: { x: endGridX, y: endGridY },
        });
      }

      const pathfindingResult = await this.startPathfindingQueue(
        npc,
        target,
        startGridX,
        startGridY,
        endGridX,
        endGridY
      );

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

          const path = await this.getResultsFromPathfindingAlgorithm(npc.scene, {
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

  @TrackNewRelicTransaction()
  private async getResultsFromPathfindingAlgorithm(
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

    let finder, path;

    if (appEnv.general.IS_UNIT_TEST) {
      finder = new PF.BestFirstFinder();
      path = finder.findPath(firstNode.x, firstNode.y, lastNode.x, lastNode.y, grid);
    } else {
      console.time("pathfinding");
      const result = await this.microserviceRequest.requestMicroservice<IRPGPathfinderResponse>(
        AvailableMicroservices.RpgPathfinding,
        "/path",
        {
          startX: firstNode.x,
          startY: firstNode.y,
          endX: lastNode.x,
          endY: lastNode.y,
          grid,
        }
      );

      console.timeEnd("pathfinding");
      path = result.path;
    }

    const pathWithoutOffset = path.map(([x, y]) => [x + data.startX, y + data.startY]);

    if (pathWithoutOffset.length < 1 && retries < 3) {
      gridCourse.offset = Math.pow(10, retries + 1);
      return await this.getResultsFromPathfindingAlgorithm(map, gridCourse, retries + 1);
    }

    return pathWithoutOffset;
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }
}
