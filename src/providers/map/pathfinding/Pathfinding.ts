import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MessagingBrokerMessaging } from "@providers/microservice/messaging-broker/MessagingBrokerMessaging";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { FromGridX, FromGridY } from "@rpg-engine/shared";
import PF from "pathfinding";
import { GridManager, IGridCourse } from "../GridManager";
import { LightweightPathfinder } from "./LightweightPathfinder";

interface IRPGPathfinderResponse {
  path: number[][];
  error?: string;
}

@provideSingleton(Pathfinding)
export class Pathfinding {
  constructor(
    private locker: Locker,
    private dynamicQueue: DynamicQueue,
    private gridManager: GridManager,
    private lightweightPathfinder: LightweightPathfinder,
    private npcTarget: NPCTarget,
    private messagingBrokerMessaging: MessagingBrokerMessaging
  ) {}

  public async addListener(): Promise<void> {
    await this.messagingBrokerMessaging.listenForMessages("rpg_pathfinding", "path_result", async (data) => {});
  }

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
      const requestData = {
        startX: firstNode.x,
        startY: firstNode.y,
        endX: lastNode.x,
        endY: lastNode.y,
        grid,
      };

      try {
        const result = await this.messagingBrokerMessaging.sendAndWaitForResponse<
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

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }
}
