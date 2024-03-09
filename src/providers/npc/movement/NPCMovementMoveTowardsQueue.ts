import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { Locker } from "@providers/locks/Locker";
import { MapHelper } from "@providers/map/MapHelper";
import { PathfindingCaching } from "@providers/map/PathfindingCaching";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  EntityAttackType,
  EnvType,
  FromGridX,
  FromGridY,
  NPCAlignment,
  NPCMovementType,
  NPCPathOrientation,
  NPCSocketEvents,
  RangeTypes,
  ToGridX,
  ToGridY,
} from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import { provide } from "inversify-binding-decorators";
import _, { debounce } from "lodash";
import { NPCBattleCycleQueue } from "../NPCBattleCycleQueue";
import { NPCFreezer } from "../NPCFreezer";
import { NPCView } from "../NPCView";
import { NPCMovement } from "./NPCMovement";
import { NPCTarget } from "./NPCTarget";

import { RedisManager } from "@providers/database/RedisManager";
import { v4 as uuidv4 } from "uuid";
export interface ICharacterHealth {
  id: string;
  health: number;
}

@provide(NPCMovementMoveTowardsQueue)
export class NPCMovementMoveTowardsQueue {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private connection;

  private queueName: string = `npc-movement-move-towards-${uuidv4()}-${
    appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id
  }`;

  debouncedFaceTarget: _.DebouncedFunc<(npc: INPC, targetCharacter: ICharacter) => Promise<void>>;

  constructor(
    private redisManager: RedisManager,
    private movementHelper: MovementHelper,
    private npcMovement: NPCMovement,
    private npcTarget: NPCTarget,
    private socketMessaging: SocketMessaging,
    private npcView: NPCView,
    private mapHelper: MapHelper,
    private pathfindingCaching: PathfindingCaching,
    private locker: Locker,
    private npcBattleCycleQueue: NPCBattleCycleQueue,
    private inMemoryHashTable: InMemoryHashTable,
    private npcFreezer: NPCFreezer
  ) {}

  public init(): void {
    if (appEnv.general.IS_UNIT_TEST) {
      return;
    }

    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue(this.queueName, {
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
        this.queueName,
        async (job) => {
          const { npc } = job.data;

          try {
            await this.execStartMoveTowardsMovement(npc);
          } catch (err) {
            console.error(`Error processing ${this.queueName} for NPC ${npc.key}:`, err);
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

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();
    this.queue = null;
    this.worker = null;
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

  public async startMoveTowardsMovement(npc: INPC): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execStartMoveTowardsMovement(npc);
      return;
    }

    if (!this.connection || !this.queue || !this.worker) {
      this.init();
    }

    try {
      const canProceed = await this.locker.lock(`movement-move-towards-${npc._id}`);

      if (!canProceed) {
        return;
      }

      await this.queue?.add(
        `npc-move-towards-${npc._id}-${uuidv4()}`,
        { npc },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`movement-move-towards-${npc._id}`);
    }
  }

  @TrackNewRelicTransaction()
  public async execStartMoveTowardsMovement(npc: INPC): Promise<void> {
    const targetCharacter = (await Character.findById(npc.targetCharacter)
      .lean()
      .select("_id x y scene health isOnline isBanned target")) as ICharacter | null;

    // Early exit if the target is not valid
    if (
      !targetCharacter ||
      !targetCharacter.isOnline ||
      targetCharacter.scene !== npc.scene ||
      targetCharacter.isBanned
    ) {
      await Promise.all([this.npcTarget.tryToSetTarget(npc), this.tryToFreezeIfTooManyFailedTargetChecks(npc)]);
      return;
    }

    if (!npc.targetCharacter) {
      await this.tryToFreezeIfTooManyFailedTargetChecks(npc);
      return;
    }

    // Ensuring target is within range and clearing out-of-range targets
    await this.npcTarget.tryToClearOutOfRangeTargets(npc);

    // Initiate or clear battle cycle based on NPC's attack type and range
    const attackRange = npc.attackType === EntityAttackType.Melee ? 2 : npc.maxRangeAttack;
    await this.initOrClearBattleCycle(npc, targetCharacter, attackRange);

    // Check for low health and flee if necessary
    await this.fleeIfHealthIsLow(npc);

    const reachedTarget = this.reachedTarget(npc, targetCharacter);

    if (reachedTarget) {
      // Handling when the NPC has reached the target
      if (npc.pathOrientation === NPCPathOrientation.Backward) {
        await NPC.updateOne({ _id: npc.id }, { pathOrientation: NPCPathOrientation.Forward });
      }

      if (appEnv.general.IS_UNIT_TEST) {
        await this.faceTarget(npc, targetCharacter);
      } else {
        this.debouncedFaceTarget = debounce(this.faceTarget, 300);
        await this.debouncedFaceTarget(npc, targetCharacter);
      }

      return;
    }

    // Movement logic when the target hasn't been reached
    if (npc.pathOrientation === NPCPathOrientation.Forward) {
      const isUnderOriginalPositionRange = this.movementHelper.isUnderRange(
        npc.x,
        npc.y,
        npc.initialX,
        npc.initialY,
        npc.maxAntiLuringRangeInGridCells ?? RangeTypes.Medium
      );

      if (isUnderOriginalPositionRange) {
        if (npc.scene === targetCharacter.scene) {
          await this.moveTowardsPosition(npc, targetCharacter, targetCharacter.x, targetCharacter.y);
        }
      } else {
        npc.pathOrientation = NPCPathOrientation.Backward;
        await NPC.updateOne({ _id: npc.id }, { pathOrientation: NPCPathOrientation.Backward });
      }
    } else if (npc.pathOrientation === NPCPathOrientation.Backward) {
      await this.moveTowardsPosition(npc, targetCharacter, npc.initialX, npc.initialY);
    }
  }

  @TrackNewRelicTransaction()
  private async tryToFreezeIfTooManyFailedTargetChecks(npc: INPC): Promise<void> {
    const targetCheckCount = ((await this.inMemoryHashTable.get("npc-target-check-count", npc._id)) ?? 0) as number;

    await this.inMemoryHashTable.set("npc-target-check-count", npc._id, targetCheckCount + 1);

    if (targetCheckCount >= 3) {
      await this.npcFreezer.freezeNPC(npc, "freezing NPC due to invalid target");
      await this.inMemoryHashTable.delete("npc-target-check-count", npc._id);
    }
  }

  @TrackNewRelicTransaction()
  private async fleeIfHealthIsLow(npc: INPC): Promise<void> {
    if (npc.fleeOnLowHealth) {
      if (npc.health <= npc.maxHealth / 4) {
        await NPC.updateOne({ _id: npc._id }, { currentMovementType: NPCMovementType.MoveAway });
      }
    }
  }

  @TrackNewRelicTransaction()
  private async moveBackToOriginalPosIfNoTarget(npc: INPC, target: ICharacter): Promise<void> {
    if (
      !npc.targetCharacter &&
      !this.reachedInitialPosition(npc) &&
      npc.pathOrientation === NPCPathOrientation.Backward
    ) {
      await this.moveTowardsPosition(npc, target, npc.initialX, npc.initialY);
    }
  }

  @TrackNewRelicTransaction()
  private async initOrClearBattleCycle(
    npc: INPC,
    targetCharacter: ICharacter,

    maxRangeInGridCells
  ): Promise<void> {
    if (npc.alignment === NPCAlignment.Hostile) {
      // if melee, only start battle cycle if target is in melee range

      const isInRange = this.movementHelper.isUnderRange(
        npc.x,
        npc.y,
        targetCharacter.x,
        targetCharacter.y,
        maxRangeInGridCells
      );

      if (isInRange) {
        await this.initBattleCycle(npc, targetCharacter);
      }
    }
  }

  @TrackNewRelicTransaction()
  private async faceTarget(npc: INPC, targetCharacter: ICharacter): Promise<void> {
    if (!targetCharacter) {
      return;
    }

    const facingDirection = this.npcTarget.getTargetDirection(npc, targetCharacter.x, targetCharacter.y);

    // If the NPC is already facing the target, exit the method
    if (npc.direction === facingDirection) {
      return;
    }

    await NPC.updateOne({ _id: npc.id }, { direction: facingDirection });

    const nearbyCharacters = await this.npcView.getCharactersInView(npc);

    // Filter characters needing updates based on the fetched client NPCs
    const charactersNeedingUpdates: ICharacter[] = nearbyCharacters.filter((nearbyCharacter) => {
      return nearbyCharacter?.direction !== facingDirection;
    });

    // Broadcast to all characters needing an update
    for (const character of charactersNeedingUpdates) {
      this.socketMessaging.sendEventToUser(character.channelId!, NPCSocketEvents.NPCDataUpdate, {
        id: npc.id,
        direction: npc.direction,
        x: npc.x,
        y: npc.y,
      });
    }
  }

  private reachedInitialPosition(npc: INPC): boolean {
    return npc.x === npc.initialX && npc.y === npc.initialY;
  }

  private reachedTarget(npc: INPC, targetCharacter: ICharacter): boolean {
    const reachedInitialPosition = this.reachedInitialPosition(npc);

    switch (npc.pathOrientation) {
      case NPCPathOrientation.Forward:
        return this.movementHelper.isUnderRange(npc.x, npc.y, targetCharacter.x, targetCharacter.y, 1);

      case NPCPathOrientation.Backward:
        return reachedInitialPosition;
    }

    return false;
  }

  @TrackNewRelicTransaction()
  private async initBattleCycle(npc: INPC, targetCharacter: ICharacter): Promise<void> {
    if (!npc.isAlive || !npc.targetCharacter || !npc.isBehaviorEnabled) {
      return;
    }

    if (!targetCharacter.isOnline || targetCharacter.isBanned || targetCharacter.health <= 0) {
      await this.npcTarget.clearTarget(npc);
      return;
    }

    const canProceed = await this.locker.lock(`npc-${npc._id}-npc-battle-cycle`);

    if (!canProceed) {
      return;
    }

    const npcSkills = (await Skill.findOne({
      _id: npc.skills,
    })
      .lean({ virtuals: true, defaults: true })
      .cacheQuery({
        cacheKey: `${npc.id}-skills`,
        ttl: 60 * 60 * 24 * 7,
      })) as ISkill;

    await this.npcBattleCycleQueue.add(npc, npcSkills);
  }

  @TrackNewRelicTransaction()
  private async moveTowardsPosition(npc: INPC, target: ICharacter, x: number, y: number): Promise<void> {
    try {
      const shortestPath = await this.npcMovement.getShortestPathNextPosition(
        npc,
        target,
        ToGridX(npc.x),
        ToGridY(npc.y),
        ToGridX(x),
        ToGridY(y)
      );
      if (!shortestPath) {
        // throw new Error("No shortest path found!");
        // await this.npcTarget.clearTarget(npc);
        return;
      }
      const { newGridX, newGridY, nextMovementDirection } = shortestPath;
      const validCoordinates = this.mapHelper.areAllCoordinatesValid([newGridX, newGridY]);
      if (validCoordinates && nextMovementDirection) {
        const hasMoved = await this.npcMovement.moveNPC(
          npc,
          npc.x,
          npc.y,
          FromGridX(newGridX),
          FromGridY(newGridY),
          nextMovementDirection
        );

        if (!hasMoved) {
          // probably there's a solid on the way, lets clear the pathfinding caching to force a recalculation
          await this.pathfindingCaching.delete(npc.scene, {
            start: {
              x: ToGridX(npc.x),
              y: ToGridY(npc.y),
            },
            end: {
              x: ToGridX(x),
              y: ToGridY(y),
            },
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
