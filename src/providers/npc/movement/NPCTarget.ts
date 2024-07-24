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
    if (npc.y < targetY) return "down";
    if (npc.y > targetY) return "up";
    if (npc.x < targetX) return "right";
    if (npc.x > targetX) return "left";
    return "down";
  }

  @TrackNewRelicTransaction()
  public async tryToSetTarget(npc: INPC): Promise<void> {
    if (npc.targetCharacter || npc.health === 0 || !npc.maxRangeInGridCells) {
      return;
    }

    const canProceed = await this.locker.lock(`npc-try-set-target-${npc._id}`);
    if (!canProceed) return;

    try {
      const minDistanceCharacter = await this.npcView.getNearestCharacter(npc);
      if (!minDistanceCharacter) return;

      const character = await this.getCharacter(minDistanceCharacter.id);
      if (!character) return;

      if (!(await this.canTargetCharacter(npc, character))) return;

      await this.setTargetCharacter(npc, character);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await this.locker.unlock(`npc-try-set-target-${npc._id}`);
    }
  }

  @TrackNewRelicTransaction()
  public async tryToClearOutOfRangeTargets(npc: INPC): Promise<void> {
    if (!npc.targetCharacter || !npc.maxRangeInGridCells) return;

    const targetCharacter = await this.getCharacter(npc.targetCharacter as string);
    if (!targetCharacter) {
      console.debug(`Error in ${npc.key}: Failed to find targetCharacter!`);
      await this.clearTarget(npc);
      return;
    }

    const rangeThreshold = this.getRangeThreshold(npc);
    if (!rangeThreshold) {
      throw new Error(`NPC ${npc.key}: Failed to calculate rangeThresholdDefinition!`);
    }

    if (!this.isTargetInRange(npc, targetCharacter, rangeThreshold)) {
      await this.clearTarget(npc);
    }
  }

  @TrackNewRelicTransaction()
  public async setTarget(npc: INPC, character: ICharacter): Promise<void> {
    if (!npc.isAlive || npc.health === 0 || character?.health === 0) return;

    const char = await this.getCharacter(character._id);
    if (!char) return;

    await this.setTargetCharacter(npc, char);
  }

  private async getCharacter(characterId: string): Promise<ICharacter | null> {
    return await Character.findById(characterId).lean<ICharacter>();
  }

  private async canTargetCharacter(npc: INPC, character: ICharacter): Promise<boolean> {
    if (await this.stealth.isInvisible(character)) {
      await this.tryToDetectInvisibleCharacters(npc, character);
      if (await this.stealth.isInvisible(character)) return false;
    }

    const rangeThreshold = this.getRangeThreshold(npc);
    if (!rangeThreshold) {
      throw new Error(`NPC ${npc.key}: Failed to calculate rangeThresholdDefinition!`);
    }

    if (!this.isTargetInRange(npc, character, rangeThreshold)) {
      await this.clearTarget(npc);
      return false;
    }

    if (this.shouldPreventNPCAttack(npc, character)) {
      await this.clearTarget(npc);
      return false;
    }

    return true;
  }

  private getRangeThreshold(npc: INPC): number | undefined {
    return npc.targetType === NPCTargetType.Talking ? NPC_MAX_TALKING_DISTANCE_IN_GRID : npc.maxRangeInGridCells;
  }

  private async tryToDetectInvisibleCharacters(npc: INPC, target: ICharacter): Promise<void> {
    const npcLevel = (npc.skills as ISkill)?.level ?? 1;
    const wasDetected = this.checkInvisibilityDetected(npcLevel);

    if (wasDetected) {
      await this.stealth.turnVisible(target);
      this.notifyDetection(target);
    }
  }

  private checkInvisibilityDetected(npcLevel: number): boolean {
    const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
    const detectionThreshold = sigmoid(npcLevel - 5) * 100 * STEALTH_DETECTION_THRESHOLD;
    return Math.random() * 100 <= detectionThreshold;
  }

  private notifyDetection(character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
      message: "Oops! You have been detected!",
      type: "info",
    });
  }

  private isTargetInRange(npc: INPC, target: ICharacter, range: number): boolean {
    return this.movementHelper.isUnderRange(npc.x, npc.y, target.x, target.y, range);
  }

  private shouldPreventNPCAttack(npc: INPC, character: ICharacter): boolean {
    if (npc.raidKey !== undefined) return false;
    if (NPC_CAN_ATTACK_IN_NON_PVP_ZONE) return false;

    const isCharInNonPVPZone = this.mapNonPVPZone.isNonPVPZoneAtXY(character.scene, character.x, character.y)!;
    return isCharInNonPVPZone && npc.alignment === NPCAlignment.Hostile;
  }

  private async setTargetCharacter(npc: INPC, character: ICharacter): Promise<void> {
    await NPC.updateOne({ _id: npc._id }, { $set: { targetCharacter: character._id, isBehaviorEnabled: true } });
  }
}
