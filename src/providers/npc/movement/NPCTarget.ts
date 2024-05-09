import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { STEALTH_DETECTION_THRESHOLD } from "@providers/constants/BattleConstants";
import { NPC_CAN_ATTACK_IN_NON_PVP_ZONE } from "@providers/constants/NPCConstants";
import { Locker } from "@providers/locks/Locker";
import { MapNonPVPZone } from "@providers/map/MapNonPVPZone";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Stealth } from "@providers/spells/data/logic/rogue/Stealth";
import {
  IUIShowMessage,
  NPCAlignment,
  NPCTargetType,
  NPC_MAX_TALKING_DISTANCE_IN_GRID,
  UISocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { NPCView } from "../NPCView";
import { NPCDirection } from "./NPCMovement";

@provide(NPCTarget)
export class NPCTarget {
  constructor(
    private npcView: NPCView,
    private movementHelper: MovementHelper,
    private mapNonPVPZone: MapNonPVPZone,
    private stealth: Stealth,
    private locker: Locker,
    private socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public async clearTarget(npc: INPC): Promise<void> {
    await NPC.updateOne(
      { _id: npc.id },
      {
        $set: {
          targetType: NPCTargetType.Default,
          currentMovementType: npc.originalMovementType,
        },
        $unset: {
          targetCharacter: "",
        },
      }
    );
    await this.locker.unlock(`npc-${npc._id}-npc-battle-cycle`);
  }

  public getTargetDirection(npc: INPC, targetX: number, targetY: number): NPCDirection {
    if (npc.y < targetY) {
      return "down";
    }

    if (npc.y > targetY) {
      return "up";
    }

    if (npc.x < targetX) {
      return "right";
    }

    if (npc.x > targetX) {
      return "left";
    }

    return "down";
  }

  @TrackNewRelicTransaction()
  public async tryToSetTarget(npc: INPC): Promise<void> {
    try {
      if (npc.targetCharacter) {
        return;
      }

      const canProceed = await this.locker.lock(`npc-try-set-target-${npc._id}`);

      if (!canProceed) {
        return;
      }

      if (!npc.isAlive || npc.health === 0) {
        return;
      }

      if (!npc.maxRangeInGridCells) {
        throw new Error(
          `NPC ${npc.key} is trying to set target, but no maxRangeInGridCells is specified (required for range)!`
        );
      }

      const minDistanceCharacter = await this.npcView.getNearestCharacter(npc);

      if (!minDistanceCharacter) {
        return;
      }

      await this.tryToDetectInvisibleCharacters(npc, minDistanceCharacter);

      if (await this.stealth.isInvisible(minDistanceCharacter)) {
        return;
      }

      const rangeThresholdDefinition = this.getRangeThreshold(npc);

      if (!rangeThresholdDefinition) {
        throw new Error(`NPC ${npc.key} is trying to set target, failed ot calculate rangeThresholdDefinition!`);
      }

      // check if character is under range
      const isMovementUnderRange = this.movementHelper.isUnderRange(
        npc.x,
        npc.y,
        minDistanceCharacter.x,
        minDistanceCharacter.y,
        rangeThresholdDefinition
      );

      if (!isMovementUnderRange) {
        await this.clearTarget(npc);
        return;
      }

      const character = await Character.findById(minDistanceCharacter.id).lean();

      if (!character) {
        return;
      }

      const isRaid = npc.raidKey !== undefined;
      const freeze = !isRaid;

      if (!NPC_CAN_ATTACK_IN_NON_PVP_ZONE && freeze) {
        const isCharInNonPVPZone = this.mapNonPVPZone.isNonPVPZoneAtXY(character.scene, character.x, character.y);
        // This is needed to prevent NPCs(Hostile) from attacking players in non-PVP zones
        if (isCharInNonPVPZone && npc.alignment === NPCAlignment.Hostile) {
          await this.clearTarget(npc);

          return;
        }
      }

      // set target using updateOne
      await NPC.updateOne({ _id: npc._id }, { $set: { targetCharacter: character._id, isBehaviorEnabled: true } });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await this.locker.unlock(`npc-try-set-target-${npc._id}`);
    }
  }

  @TrackNewRelicTransaction()
  public async tryToClearOutOfRangeTargets(npc: INPC): Promise<void> {
    if (!npc.targetCharacter) {
      // no target set, nothing to remove here!
      return;
    }

    if (!npc.maxRangeInGridCells) {
      throw new Error(`NPC ${npc.key} is trying to verify target, but no maxRangeInGridCells is specified!`);
    }

    const targetCharacter = await Character.findById(npc.targetCharacter).lean();

    if (!targetCharacter) {
      console.debug(`Error in ${npc.key}: Failed to find targetCharacter!`);
      return;
    }

    const rangeThresholdDefinition = this.getRangeThreshold(npc);

    if (!rangeThresholdDefinition) {
      throw new Error(`NPC ${npc.key} is trying to set target, failed to calculate rangeThresholdDefinition!`);
    }

    const isCharacterUnderRange = this.movementHelper.isUnderRange(
      npc.x,
      npc.y,
      targetCharacter.x,
      targetCharacter.y,
      rangeThresholdDefinition
    );

    // if target is out of range or not online or invisible, lets remove it
    if ((targetCharacter && !isCharacterUnderRange) || !targetCharacter.isOnline) {
      // remove npc.targetCharacter
      await this.clearTarget(npc);
    }
  }

  @TrackNewRelicTransaction()
  public async setTarget(npc: INPC, character: ICharacter): Promise<void> {
    try {
      if (!(npc.isAlive || npc.health === 0) || character?.health === 0) {
        return;
      }

      const char = await Character.findById(character._id).lean();
      if (!char) {
        return;
      }

      await NPC.updateOne({ _id: npc._id }, { $set: { targetCharacter: char._id } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private getRangeThreshold(npc: INPC): number | undefined {
    switch (npc.targetType) {
      case NPCTargetType.Default:
        return npc.maxRangeInGridCells;

      case NPCTargetType.Talking:
        return NPC_MAX_TALKING_DISTANCE_IN_GRID;
    }

    return npc.maxRangeInGridCells;
  }

  private async tryToDetectInvisibleCharacters(npc: INPC, minDistanceCharacter: ICharacter): Promise<void> {
    const isTargetInvisible = await this.stealth.isInvisible(minDistanceCharacter as ICharacter);
    const npcLevel = (npc.skills as ISkill)?.level ?? 1;

    if (isTargetInvisible) {
      const wasDetected = this.checkInvisibilityDetected(npcLevel);

      if (wasDetected) {
        await this.stealth.turnVisible(minDistanceCharacter as ICharacter);

        this.socketMessaging.sendEventToUser<IUIShowMessage>(
          (minDistanceCharacter as ICharacter).channelId!,
          UISocketEvents.ShowMessage,
          {
            message: "Oops! You have been detected!",
            type: "info",
          }
        );
      }
    }
  }

  private checkInvisibilityDetected(npcLevel: number): boolean {
    const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
    const detectionThreshold = sigmoid(npcLevel - 5) * 100 * STEALTH_DETECTION_THRESHOLD;

    const randomNumber = Math.random() * 100;
    return randomNumber <= detectionThreshold;
  }
}
