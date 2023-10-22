import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { Job, Queue, Worker } from "bullmq";
import { Pathfinder } from "./Pathfinder";
import { PathfindingResults } from "./PathfindingResults";

@provideSingleton(PathfindingQueue)
export class PathfindingQueue {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private connection;

  constructor(
    private redisManager: RedisManager,
    private pathfinder: Pathfinder,
    private pathfindingResults: PathfindingResults,
    private locker: Locker
  ) {}

  public init(): void {
    if (appEnv.general.IS_UNIT_TEST) {
      return;
    }

    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue("pathfinding", {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.queue.on("error", async (error) => {
          console.error("Error in the pathfindingQueue:", error);

          await this.queue?.close();
          this.queue = null;
        });
      }
    }

    if (!this.worker) {
      this.worker = new Worker(
        "pathfinding",
        async (job) => {
          const { npc, target, startGridX, startGridY, endGridX, endGridY } = job.data;

          try {
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
          } catch (err) {
            console.error(`Error processing pathfinding for NPC ${npc.key}:`, err);
            throw err;
          }
        },
        {
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.log(`Pathfinding job ${job?.id} failed with error ${err.message}`);

          await this.worker?.close();
          this.worker = null;
        });
      }
    }
  }

  public async clearAllJobs(): Promise<void> {
    if (!this.connection || !this.queue || !this.worker) {
      this.init();
    }

    const jobs = (await this.queue?.getJobs(["waiting", "active", "delayed", "paused"])) ?? [];
    for (const job of jobs) {
      try {
        await job?.remove();
      } catch (err) {
        console.error(`Error removing job ${job?.id}:`, err.message);
      }
    }
  }

  async addPathfindingJob(
    npc: INPC,
    target: ICharacter | null,
    startGridX: number,
    startGridY: number,
    endGridX: number,
    endGridY: number
  ): Promise<Job | undefined> {
    if (!this.connection || !this.queue || !this.worker) {
      this.init();
    }

    try {
      const canProceed = await this.locker.lock(`pathfinding-${npc._id}`);

      if (!canProceed) {
        return;
      }

      return await this.queue?.add(
        "pathfindingJob",
        { npc, target, startGridX, startGridY, endGridX, endGridY },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`pathfinding-${npc._id}`);
    }
  }

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();
    this.queue = null;
    this.worker = null;
  }
}
