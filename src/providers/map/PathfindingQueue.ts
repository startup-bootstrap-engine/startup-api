import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import {
  PATHFINDING_MAX_TRIES,
  PATHFINDING_POLLER_BACKOFF_FACTOR,
  PATHFINDING_POLLER_INTERVAL,
} from "@providers/constants/PathfindingConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { Job } from "bullmq";
import { Pathfinder } from "./Pathfinder";
import { PathfindingResults } from "./PathfindingResults";

@provideSingleton(PathfindingQueue)
export class PathfindingQueue {
  constructor(
    private pathfinder: Pathfinder,
    private pathfindingResults: PathfindingResults,
    private locker: Locker,
    private dynamicQueue: DynamicQueue
  ) {}

  public async findPathForNPC(
    npc: INPC,
    target: ICharacter | null,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<number[][] | undefined> {
    const job = await this.addPathfindingJob(npc, target, startGridX, startGridY, endGridX, endGridY);
    if (!job) {
      return;
    }

    return this.pathfinderPoller(job.id!);
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
      const canProceed = await this.locker.lock(`pathfinding-${npc._id}`);

      if (!canProceed) {
        return;
      }

      return await this.dynamicQueue.addJob(
        "npc-pathfinding-queue",
        async (job) => {
          const { npc, target, startGridX, startGridY, endGridX, endGridY } = job.data;

          const path = await this.pathfinder.findShortestPath(
            npc as INPC,
            target,
            npc.scene,
            startGridX,
            startGridY,
            endGridX,
            endGridY
          );

          if (!path) {
            return;
          }

          void this.pathfindingResults.setResult(job.id!, path);
        },
        {
          npc,
          target,
          startGridX,
          startGridY,
          endGridX,
          endGridY,
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`pathfinding-${npc._id}`);
    }
  }

  @TrackNewRelicTransaction()
  public async pathfinderPoller(jobId: string): Promise<number[][]> {
    if (!jobId) {
      throw new Error("Job ID is required!");
    }

    let tries = 0;
    let delay = PATHFINDING_POLLER_INTERVAL;

    while (tries <= PATHFINDING_MAX_TRIES) {
      try {
        const npcPath: number[][] | null = await this.pathfindingResults.getResult(jobId);

        if (npcPath) {
          await this.pathfindingResults.deleteResult(jobId);
          return npcPath;
        }

        tries++;
        await this.increaseDelay(delay);
        delay = delay * PATHFINDING_POLLER_BACKOFF_FACTOR; // Exponential backoff
      } catch (error) {
        console.error(error);
        if (tries >= PATHFINDING_MAX_TRIES) throw error;
      }
    }

    await this.pathfindingResults.deleteResult(jobId);
    throw new Error("Error while trying to fetch pathfinding result for NPC. Timeout!");
  }

  private async increaseDelay(delay: number): Promise<void> {
    return await new Promise((resolve) => setTimeout(resolve, delay));
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }
}
