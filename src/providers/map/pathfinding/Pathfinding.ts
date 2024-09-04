import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MessagingBroker } from "@providers/microservice/messaging-broker/MessagingBrokerMessaging";
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
    private messagingBroker: MessagingBroker
  ) {}

  public async requestShortestPathCalculation(
    npc: INPC,
    target: ICharacter | null,
    map: string,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<void> {
    if (!(await this.locker.lock(`pathfinding-${npc._id}`))) return;

    try {
      const gridCourse = this.createGridCourse(startGridX, startGridY, endGridX, endGridY);
      const output = this.prepareGridAndNodes(map, gridCourse)!;

      if (!output || !output.grid || !output.firstNode || !output.lastNode || !output.startX || !output.startY) {
        return;
      }

      const { grid, firstNode, lastNode, startX, startY } = output;

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

      // We're currently using a messaging broker to communicate with the pathfinding microservice
      await this.messagingBroker.sendMessage("rpg_pathfinding", "find_path", data);
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`pathfinding-${npc._id}`);
    }
  }

  @TrackNewRelicTransaction()
  public async deprecatedFindShortedPath(
    npc: INPC,
    target: ICharacter | null,
    map: string,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<number[][] | undefined> {
    //! This is only kept here for unit tests. It should be removed "in the future".

    if (!(await this.locker.lock(`pathfinding-${npc._id}`))) return;

    try {
      const pathfindingResult = appEnv.general.IS_UNIT_TEST
        ? await this.deprecatedGetPathfindingResults(
            map,
            this.createGridCourse(startGridX, startGridY, endGridX, endGridY)
          )
        : await this.triggerLightweightPathfinding(npc, endGridX, endGridY);

      if (pathfindingResult && pathfindingResult.length > 0) return pathfindingResult;

      await this.npcTarget.tryToSetTarget(npc);
      return await this.triggerLightweightPathfinding(npc, endGridX, endGridY);
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`pathfinding-${npc._id}`);
    }
  }

  private createGridCourse(startX: number, startY: number, endX: number, endY: number): IGridCourse {
    return { start: { x: startX, y: startY }, end: { x: endX, y: endY } };
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
    return nearestGridToTarget?.length ? nearestGridToTarget : undefined;
  }

  private deprecatedGetPathfindingResults(map: string, gridCourse: IGridCourse): number[][] {
    const output = this.prepareGridAndNodes(map, gridCourse)!;

    if (!output || !output.grid || !output.firstNode || !output.lastNode || !output.startX || !output.startY) {
      return [];
    }

    const { grid, firstNode, lastNode, startX, startY } = output;

    const path = this.findPathInUnitTest(firstNode, lastNode, grid);
    return this.applyOffsetToPath(path, startX, startY);
  }

  private prepareGridAndNodes(
    map: string,
    gridCourse: IGridCourse
  ):
    | {
        grid: PF.Grid;
        firstNode: { x: number; y: number };
        lastNode: { x: number; y: number };
        startX: number;
        startY: number;
      }
    | undefined {
    const data = this.gridManager.generateGridBetweenPoints(map, gridCourse, 20);
    if (!data || !data.grid) {
      throw new Error("Grid data is not properly initialized.");
    }

    const firstNode = { x: gridCourse.start.x - data.startX, y: gridCourse.start.y - data.startY };
    const lastNode = { x: gridCourse.end.x - data.startX, y: gridCourse.end.y - data.startY };

    if (!this.isNodeWithinBounds(data.grid, firstNode) || !this.isNodeWithinBounds(data.grid, lastNode)) {
      return;
    }

    data.grid.setWalkableAt(firstNode.x, firstNode.y, true);
    data.grid.setWalkableAt(lastNode.x, lastNode.y, true);

    return { grid: data.grid, firstNode, lastNode, startX: data.startX, startY: data.startY };
  }

  private isNodeWithinBounds(grid: PF.Grid, node: { x: number; y: number }): boolean {
    return node.x >= 0 && node.x < grid.width && node.y >= 0 && node.y < grid.height;
  }

  private findPathInUnitTest(
    firstNode: { x: number; y: number },
    lastNode: { x: number; y: number },
    grid: PF.Grid
  ): number[][] {
    return new PF.BestFirstFinder().findPath(firstNode.x, firstNode.y, lastNode.x, lastNode.y, grid);
  }

  public applyOffsetToPath(path: number[][], startX: number, startY: number): number[][] {
    return path.map(([x, y]) => [x + startX, y + startY]);
  }
}
