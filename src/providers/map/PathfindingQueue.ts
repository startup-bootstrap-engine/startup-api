import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { QUEUE_NPC_MAX_SCALE_FACTOR } from "@providers/constants/QueueConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MultiQueue } from "@providers/queue/MultiQueue";
import { Job } from "bullmq";
import { Pathfinder } from "./Pathfinder";
import { PathfindingResults } from "./PathfindingResults";
@provideSingleton(PathfindingQueue)
export class PathfindingQueue {
  constructor(
    private pathfinder: Pathfinder,
    private pathfindingResults: PathfindingResults,
    private locker: Locker,
    private multiQueue: MultiQueue
  ) {}

  async addPathfindingJob(
    npc: INPC,
    totalActiveNPCs: number,
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

      const maxQueues = Math.ceil(totalActiveNPCs / 10) || 1;
      const queueScaleFactor = Math.min(maxQueues, QUEUE_NPC_MAX_SCALE_FACTOR);

      return await this.multiQueue.addJob(
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

          await this.pathfindingResults.setResult(job.id!, path);
        },
        {
          npc,
          target,
          startGridX,
          startGridY,
          endGridX,
          endGridY,
        },
        queueScaleFactor,
        npc.scene
      );
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`pathfinding-${npc._id}`);
    }
  }

  public async clearAllJobs(): Promise<void> {
    await this.multiQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.multiQueue.shutdown();
  }
}
