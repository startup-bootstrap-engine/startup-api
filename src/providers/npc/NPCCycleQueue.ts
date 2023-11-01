import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { NPC_CYCLE_INTERVAL_RATIO, NPC_FRIENDLY_FREEZE_CHECK_CHANCE } from "@providers/constants/NPCConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { SpecialEffect } from "@providers/entityEffects/SpecialEffect";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { NPCAlignment, NPCMovementType, NPCPathOrientation, ToGridX, ToGridY } from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import { random } from "lodash";
import { NPCFreezer } from "./NPCFreezer";
import { NPCView } from "./NPCView";
import { NPCMovement } from "./movement/NPCMovement";
import { NPCMovementFixedPath } from "./movement/NPCMovementFixedPath";
import { NPCMovementMoveAway } from "./movement/NPCMovementMoveAway";
import { NPCMovementMoveTowards } from "./movement/NPCMovementMoveTowards";
import { NPCMovementRandomPath } from "./movement/NPCMovementRandomPath";
import { NPCMovementStopped } from "./movement/NPCMovementStopped";

@provideSingleton(NPCCycleQueue)
export class NPCCycleQueue {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;

  constructor(
    private specialEffect: SpecialEffect,
    private npcView: NPCView,
    private npcFreezer: NPCFreezer,
    private npcMovement: NPCMovement,
    private npcMovementFixedPath: NPCMovementFixedPath,
    private npcMovementRandom: NPCMovementRandomPath,
    private npcMovementMoveTowards: NPCMovementMoveTowards,
    private npcMovementStopped: NPCMovementStopped,
    private npcMovementMoveAway: NPCMovementMoveAway,

    private newRelic: NewRelic,
    private locker: Locker,
    private redisManager: RedisManager
  ) {}

  public init(): void {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue("npc-cycle-queue", {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.queue.on("error", async (error) => {
          console.error("Error in the npc-cycle-queue :", error);

          await this.queue?.close();
          this.queue = null;
        });
      }
    }

    if (!this.worker) {
      this.worker = new Worker(
        "npc-cycle-queue",
        async (job) => {
          const { npc, npcSkills } = job.data;

          try {
            await this.execNpcCycle(npc, npcSkills);
          } catch (err) {
            console.error(`Error processing npc-cycle-queue for NPC ${npc.key}:`, err);
            throw err;
          }
        },
        {
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.log(`npc-cycle-queue job ${job?.id} failed with error ${err.message}`);

          await this.worker?.close();
          this.worker = null;
        });
      }
    }
  }

  @TrackNewRelicTransaction()
  public async add(npc: INPC, npcSkills: ISkill): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execNpcCycle(npc, npcSkills);
      return;
    }

    if (!this.connection || !this.queue || !this.worker) {
      this.init();
    }

    const isJobBeingProcessed = await this.isJobBeingProcessed(npc._id);

    if (isJobBeingProcessed) {
      return;
    }

    await this.queue?.add(
      "npc-cycle-queue",
      {
        npcId: npc._id,
        npc,
        npcSkills,
      },
      {
        delay: (1600 + random(0, 200)) / (npc.speed * 1.6) / NPC_CYCLE_INTERVAL_RATIO,
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  public async clearAllJobs(): Promise<void> {
    if (!this.queue) {
      await this.init();
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

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();
    this.queue = null;
    this.worker = null;
  }

  private async isJobBeingProcessed(npcId: string): Promise<boolean> {
    const existingJobs = (await this.queue?.getJobs(["waiting", "active", "delayed"])) ?? [];
    const isJobExisting = existingJobs.some((job) => job?.data?.npcId === npcId);

    if (isJobExisting) {
      return true; // Don't enqueue a new job if one with the same callbackId already exists
    }

    return false;
  }

  @TrackNewRelicTransaction()
  private async execNpcCycle(npc: INPC, npcSkills: ISkill): Promise<void> {
    this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Server, "NPCCycles", 1);

    npc = await NPC.findById(npc._id).lean({
      virtuals: true,
      defaults: true,
    });

    const shouldNPCBeCleared = this.shouldNPCBeCleared(npc);

    if (shouldNPCBeCleared) {
      await this.stop(npc);
      return;
    }

    await this.friendlyNPCFreezeCheck(npc);

    npc.skills = npcSkills;

    if (await this.specialEffect.isStun(npc)) {
      await this.stop(npc);

      return;
    }

    void this.startCoreNPCBehavior(npc);
    await this.add(npc, npcSkills);
  }

  private async stop(npc: INPC): Promise<void> {
    await this.locker.unlock(`npc-${npc._id}-npc-cycle`);
    await this.npcFreezer.freezeNPC(npc, "NPCCycle stop");
  }

  private shouldNPCBeCleared(npc: INPC): boolean {
    if (!npc) return true;

    if (!npc.isBehaviorEnabled || npc.health <= 0) return true;

    return false;
  }

  @TrackNewRelicTransaction()
  private async friendlyNPCFreezeCheck(npc: INPC): Promise<void> {
    if (npc.alignment === NPCAlignment.Friendly) {
      const n = random(0, 100);

      if (n <= NPC_FRIENDLY_FREEZE_CHECK_CHANCE) {
        const nearbyCharacters = await this.npcView.getCharactersInView(npc);
        if (!nearbyCharacters.length) {
          await this.npcFreezer.freezeNPC(npc, "friendlyNPCFreezeCheck");
        }
      }
    }
  }

  @TrackNewRelicTransaction()
  private async startCoreNPCBehavior(npc: INPC): Promise<void> {
    switch (npc.currentMovementType) {
      case NPCMovementType.MoveAway:
        void this.npcMovementMoveAway.startMovementMoveAway(npc);
        break;

      case NPCMovementType.Stopped:
        void this.npcMovementStopped.startMovementStopped(npc);
        break;

      case NPCMovementType.MoveTowards:
        void this.npcMovementMoveTowards.startMoveTowardsMovement(npc);

        break;

      case NPCMovementType.Random:
        void this.npcMovementRandom.startRandomMovement(npc);
        break;
      case NPCMovementType.FixedPath:
        let endGridX = npc.fixedPath.endGridX as unknown as number;
        let endGridY = npc.fixedPath.endGridY as unknown as number;

        // if NPC is at the initial position, move forward to end position.
        if (this.npcMovement.isNPCAtPathPosition(npc, ToGridX(npc.initialX!), ToGridY(npc.initialY!))) {
          if (npc.pathOrientation !== NPCPathOrientation.Forward) {
            await NPC.updateOne(
              { _id: npc._id },
              {
                $set: {
                  pathOrientation: NPCPathOrientation.Forward,
                },
              }
            );
          }
        }

        // if NPC is at the end of the path, move backwards to initial position.
        if (this.npcMovement.isNPCAtPathPosition(npc, endGridX, endGridY)) {
          await NPC.updateOne(
            { _id: npc._id },
            {
              $set: {
                pathOrientation: NPCPathOrientation.Backward,
              },
            }
          );
        }

        if (npc.pathOrientation === NPCPathOrientation.Backward) {
          endGridX = ToGridX(npc.initialX!);
          endGridY = ToGridY(npc.initialY!);
        }

        await this.npcMovementFixedPath.startFixedPathMovement(npc, endGridX, endGridY);

        break;
    }
  }
}
