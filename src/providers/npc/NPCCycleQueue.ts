import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import {
  NPC_CYCLE_INTERVAL_RATIO,
  NPC_FRIENDLY_NEUTRAL_FREEZE_CHECK_CHANCE,
  NPC_HOSTILE_FREEZE_CHECK_CHANCE,
} from "@providers/constants/NPCConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MultiQueue } from "@providers/queue/MultiQueue";
import { Stun } from "@providers/spells/data/logic/warrior/Stun";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { NPCAlignment, NPCMovementType, NPCPathOrientation, ToGridX, ToGridY } from "@rpg-engine/shared";
import { random } from "lodash";
import { NPCFreezer } from "./NPCFreezer";
import { NPCView } from "./NPCView";
import { NPCMovement } from "./movement/NPCMovement";
import { NPCMovementFixedPath } from "./movement/NPCMovementFixedPath";
import { NPCMovementMoveAway } from "./movement/NPCMovementMoveAway";
import { NPCMovementMoveTowardsQueue } from "./movement/NPCMovementMoveTowardsQueue";
import { NPCMovementRandomPath } from "./movement/NPCMovementRandomPath";
import { NPCMovementStopped } from "./movement/NPCMovementStopped";
@provideSingleton(NPCCycleQueue)
export class NPCCycleQueue {
  constructor(
    private npcView: NPCView,
    private npcFreezer: NPCFreezer,
    private npcMovement: NPCMovement,
    private npcMovementFixedPath: NPCMovementFixedPath,
    private npcMovementRandom: NPCMovementRandomPath,
    private npcMovementMoveTowards: NPCMovementMoveTowardsQueue,
    private npcMovementStopped: NPCMovementStopped,
    private npcMovementMoveAway: NPCMovementMoveAway,
    private stun: Stun,
    private newRelic: NewRelic,
    private locker: Locker,
    private multiQueue: MultiQueue
  ) {}

  @TrackNewRelicTransaction()
  public async addToQueue(npc: INPC, npcSkills: ISkill, totalActiveNPCs: number): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execNpcCycle(npc, npcSkills, totalActiveNPCs);
    }

    const maxQueues = Math.floor(totalActiveNPCs / 10) + 1;
    const queueNumber = Math.min(Math.ceil(Math.random() * maxQueues), 100);

    await this.multiQueue.addJob(
      "npc-cycle-queue",
      npc.scene,
      async (job) => {
        const { npc, npcSkills } = job.data;

        await this.execNpcCycle(npc, npcSkills, totalActiveNPCs);
      },
      {
        npc,
        npcSkills,
      },
      queueNumber,
      {
        delay: (1600 + random(0, 200)) / (npc.speed * 1.6) / NPC_CYCLE_INTERVAL_RATIO,
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  public async clearAllJobs(): Promise<void> {
    await this.multiQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.multiQueue.shutdown();
  }

  @TrackNewRelicTransaction()
  private async execNpcCycle(npc: INPC, npcSkills: ISkill, totalActiveNPCs: number): Promise<void> {
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

    await this.npcFreezeCheck(npc);

    npc.skills = npcSkills;

    if (await this.stun.isStun(npc)) {
      await this.addToQueue(npc, npcSkills, totalActiveNPCs);

      return;
    }

    await this.startCoreNPCBehavior(npc, totalActiveNPCs);
    await this.addToQueue(npc, npcSkills, totalActiveNPCs);
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
  private async npcFreezeCheck(npc: INPC): Promise<void> {
    const n = random(0, 100);

    switch (npc.alignment) {
      case NPCAlignment.Friendly:
      case NPCAlignment.Neutral:
        if (n <= NPC_FRIENDLY_NEUTRAL_FREEZE_CHECK_CHANCE) {
          const nearbyCharacters = await this.npcView.getCharactersInView(npc);
          if (!nearbyCharacters.length) {
            await this.npcFreezer.freezeNPC(npc, "friendlyNPCFreezeCheck");
          }
        }
        break;
      case NPCAlignment.Hostile:
        if (n <= NPC_HOSTILE_FREEZE_CHECK_CHANCE) {
          const nearbyCharacters = await this.npcView.getCharactersInView(npc);
          if (!nearbyCharacters.length) {
            await this.npcFreezer.freezeNPC(npc, "hostileNPCFreezeCheck");
          }
        }

        break;
    }
  }

  @TrackNewRelicTransaction()
  private async startCoreNPCBehavior(npc: INPC, totalActiveNPCs: number): Promise<void> {
    switch (npc.currentMovementType) {
      case NPCMovementType.MoveAway:
        await this.npcMovementMoveAway.startMovementMoveAway(npc);
        break;

      case NPCMovementType.Stopped:
        await this.npcMovementStopped.startMovementStopped(npc);
        break;

      case NPCMovementType.MoveTowards:
        await this.npcMovementMoveTowards.startMoveTowardsMovement(npc, totalActiveNPCs);

        break;

      case NPCMovementType.Random:
        await this.npcMovementRandom.startRandomMovement(npc);
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
