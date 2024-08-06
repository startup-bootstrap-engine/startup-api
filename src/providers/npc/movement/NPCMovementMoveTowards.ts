import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { Locker } from "@providers/locks/Locker";
import { MapHelper } from "@providers/map/MapHelper";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  EntityAttackType,
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
import { NPCBattleCycleQueue } from "../NPCBattleCycleQueue";
import { NPCView } from "../NPCView";
import { NPCMovement } from "./NPCMovement";
import { NPCTarget } from "./NPCTarget";

import { provideSingleton } from "@providers/inversify/provideSingleton";
import { PathfindingCaching } from "@providers/map/pathfinding/PathfindingCaching";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { debounce } from "lodash";

export interface ICharacterHealth {
  id: string;
  health: number;
}

@provideSingleton(NPCMovementMoveTowards)
export class NPCMovementMoveTowards {
  private debouncedFaceTarget: (npc: INPC, targetCharacter: ICharacter) => Promise<void>;

  constructor(
    private movementHelper: MovementHelper,
    private npcMovement: NPCMovement,
    private npcTarget: NPCTarget,
    private socketMessaging: SocketMessaging,
    private npcView: NPCView,
    private mapHelper: MapHelper,
    private pathfindingCaching: PathfindingCaching,
    private locker: Locker,
    private npcBattleCycleQueue: NPCBattleCycleQueue,
    private dynamicQueue: DynamicQueue
  ) {
    this.debouncedFaceTarget = debounce(this.faceTarget.bind(this), 300);
  }

  @TrackNewRelicTransaction()
  public async startMoveTowardsMovement(npc: INPC): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execStartMoveTowardsMovement(npc);
      return;
    }

    await this.dynamicQueue.addJob(
      "npc-move-towards-queue",
      (job) => {
        const { npc } = job.data;
        void this.execStartMoveTowardsMovement(npc);
      },
      { npc },
      { queueScaleBy: "active-npcs" }
    );
  }

  private async execStartMoveTowardsMovement(npc: INPC): Promise<void> {
    const targetCharacter = await this.getTargetCharacter(npc);

    if (!this.isValidTarget(npc, targetCharacter)) {
      await this.npcTarget.tryToSetTarget(npc);
      return;
    }

    const hasBattle = await this.locker.hasLock(`npc-${npc._id}-npc-battle-cycle`);

    if (this.reachedTarget(npc, targetCharacter) && hasBattle) {
      await this.handleReachedTarget(npc, targetCharacter);
      return;
    }

    try {
      const canProceed = await this.locker.lock(`movement-move-towards-${npc._id}`);

      if (!canProceed) {
        return;
      }

      await this.handleValidTarget(npc, targetCharacter);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await this.locker.unlock(`movement-move-towards-${npc._id}`);
    }
  }

  private async getTargetCharacter(npc: INPC): Promise<ICharacter> {
    return (await Character.findById(npc.targetCharacter)
      .lean({ virtuals: true, defaults: true })
      .select("_id x y scene health isOnline isBanned target")) as ICharacter;
  }

  private isValidTarget(npc: INPC, targetCharacter: ICharacter | null): boolean {
    return !!(
      targetCharacter &&
      targetCharacter.isOnline &&
      targetCharacter.scene === npc.scene &&
      npc.targetCharacter
    );
  }

  @TrackNewRelicTransaction()
  private async handleValidTarget(npc: INPC, targetCharacter: ICharacter): Promise<void> {
    await Promise.all([this.npcTarget.tryToClearOutOfRangeTargets(npc), this.fleeIfHealthIsLow(npc)]);

    const attackRange = npc.attackType === EntityAttackType.Melee ? 2 : npc.maxRangeAttack;
    await this.initOrClearBattleCycle(npc, targetCharacter, attackRange!);

    if (this.reachedTarget(npc, targetCharacter)) {
      await this.handleReachedTarget(npc, targetCharacter);
    } else {
      await this.handleNotReachedTarget(npc, targetCharacter);
    }
  }

  @TrackNewRelicTransaction()
  private async handleReachedTarget(npc: INPC, targetCharacter: ICharacter): Promise<void> {
    if (npc.pathOrientation === NPCPathOrientation.Backward) {
      await NPC.updateOne({ _id: npc._id }, { pathOrientation: NPCPathOrientation.Forward });
      npc.pathOrientation = NPCPathOrientation.Forward; // Ensure in-memory update
    }

    if (appEnv.general.IS_UNIT_TEST) {
      await this.faceTarget(npc, targetCharacter);
    } else {
      await this.debouncedFaceTarget(npc, targetCharacter);
    }
  }

  @TrackNewRelicTransaction()
  private async handleNotReachedTarget(npc: INPC, targetCharacter: ICharacter): Promise<void> {
    if (npc.pathOrientation === NPCPathOrientation.Forward) {
      const isUnderOriginalPositionRange = this.movementHelper.isUnderRange(
        npc.x,
        npc.y,
        npc.initialX,
        npc.initialY,
        npc.maxAntiLuringRangeInGridCells ?? RangeTypes.Medium
      );

      if (isUnderOriginalPositionRange && npc.scene === targetCharacter.scene) {
        await this.moveTowardsPosition(npc, targetCharacter, targetCharacter.x, targetCharacter.y);
      } else {
        await NPC.updateOne({ _id: npc._id }, { pathOrientation: NPCPathOrientation.Backward });
        npc.pathOrientation = NPCPathOrientation.Backward;
      }
    } else if (npc.pathOrientation === NPCPathOrientation.Backward) {
      await this.moveTowardsPosition(npc, targetCharacter, npc.initialX, npc.initialY);
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
  private async initOrClearBattleCycle(
    npc: INPC,
    targetCharacter: ICharacter,
    maxRangeInGridCells: number
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

    if (npc.direction !== facingDirection) {
      await NPC.updateOne({ _id: npc._id }, { direction: facingDirection });

      const nearbyCharacters = await this.npcView.getCharactersInView(npc);
      const charactersNeedingUpdates = nearbyCharacters.filter(
        (nearbyCharacter) => nearbyCharacter?.direction !== facingDirection
      );

      for (const character of charactersNeedingUpdates) {
        this.socketMessaging.sendEventToUser(character.channelId!, NPCSocketEvents.NPCDataUpdate, {
          id: npc._id,
          direction: facingDirection,
          x: npc.x,
          y: npc.y,
        });
      }
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
    if (!(npc.isAlive || npc.health === 0) || !npc.targetCharacter || !npc.isBehaviorEnabled) {
      return;
    }

    if (!targetCharacter.isOnline || targetCharacter.isBanned || targetCharacter.health <= 0) {
      console.log(`Clearing ${npc.key} target: ${targetCharacter._id} is offline or banned or dead`);
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
        cacheKey: `${npc._id}-skills`,
        ttl: 60 * 60 * 24 * 7,
      })) as ISkill;

    await this.npcBattleCycleQueue.addToQueue(npc, npcSkills);
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
        await this.npcTarget.tryToSetTarget(npc);
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
      throw error;
    }
  }
}
