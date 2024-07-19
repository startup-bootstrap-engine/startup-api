import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { Job } from "bullmq";
import { Pathfinder } from "./Pathfinder";

@provideSingleton(PathfindingQueue)
export class PathfindingQueue {
  constructor(
    private pathfinder: Pathfinder,
    private locker: Locker,
    private dynamicQueue: DynamicQueue,
    private resultsPoller: ResultsPoller
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

    return await this.resultsPoller.pollResults("pathfinding", job.id!);
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

          await this.resultsPoller.prepareResultToBePolled("pathfinding", job.id!, path);
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

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }
}
