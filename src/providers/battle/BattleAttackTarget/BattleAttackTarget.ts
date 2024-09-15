import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterDeath } from "@providers/character/CharacterDeath/CharacterDeath";
import { CharacterWeapon } from "@providers/character/CharacterWeapon";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { Locker } from "@providers/locks/Locker";
import { MapSolidsTrajectory } from "@providers/map/MapSolidsTrajectory";
import { NPCSpellArea } from "@providers/spells/area-spells/NPCSpellArea";
import {
  BattleSocketEvents,
  GRID_WIDTH,
  IBattleCancelTargeting,
  ItemSubType,
  SOCKET_TRANSMISSION_ZONE_WIDTH,
} from "@rpg-engine/shared";
import { EntityAttackType, EntityType } from "@rpg-engine/shared/dist/types/entity.types";
import { provide } from "inversify-binding-decorators";
import { BattleCycleManager } from "../BattleCycleManager";
import { HitTargetQueue } from "../HitTargetQueue";
import { BattleNetworkStopTargeting } from "../network/BattleNetworkStopTargetting";
import { BattleAttackRanged } from "./BattleAttackRanged";
import { BattleAttackValidator } from "./BattleAttackValidator";

@provide(BattleAttackTarget)
export class BattleAttackTarget {
  constructor(
    private socketMessaging: SocketMessaging,
    private movementHelper: MovementHelper,
    private battleNetworkStopTargeting: BattleNetworkStopTargeting,
    private npcTarget: NPCTarget,
    private characterDeath: CharacterDeath, //! dont remove this
    private battleRangedAttack: BattleAttackRanged,
    private characterWeapon: CharacterWeapon,
    private battleAttackValidator: BattleAttackValidator,
    private hitTarget: HitTargetQueue,
    private npcSpellArea: NPCSpellArea,
    private mapSolidsTrajectory: MapSolidsTrajectory,
    private locker: Locker,
    private battleCycleManager: BattleCycleManager
  ) {}

  @TrackNewRelicTransaction()
  public async checkRangeAndAttack(attacker: ICharacter | INPC, target: ICharacter | INPC): Promise<boolean> {
    const lockKey = `battle-attack-${attacker.id}-${target.id}`;
    const hasLock = await this.locker.hasLock(lockKey);

    if (hasLock) {
      return false; // Battle loop is already running for this attacker-target pair
    }

    try {
      await this.locker.lock(lockKey, 5); // Lock for 5 seconds

      if (!target.isAlive) {
        await this.battleCycleManager.stopBattleCycle(attacker.id);
        return false;
      }

      const hasSolidInTrajectory = await this.mapSolidsTrajectory.isSolidInTrajectory(attacker, target);

      if (hasSolidInTrajectory) {
        return false;
      }

      // check if the NPC has an area spell to cast.
      // if casted successfully, then the attack is complete
      if (attacker.type === EntityType.NPC) {
        const castedSpell = await this.npcSpellArea.castNPCSpell(attacker as INPC, target);
        if (castedSpell) {
          return true;
        }
      }

      const attackerType = attacker.attackType || (await this.characterWeapon.getAttackType(attacker as ICharacter));

      switch (attackerType) {
        case EntityAttackType.Melee: {
          const isUnderMeleeRange = this.movementHelper.isUnderRange(attacker.x, attacker.y, target.x, target.y, 2);

          if (isUnderMeleeRange) {
            await this.hitTarget.hit(attacker, target);
            return true;
          }
          break;
        }

        case EntityAttackType.Ranged: {
          const rangedAttackParams = await this.battleAttackValidator.validateAttack(attacker, target);

          if (rangedAttackParams) {
            if (attacker.type === EntityType.Character) {
              const character = attacker as ICharacter;
              if (rangedAttackParams.itemSubType === ItemSubType.Magic) {
                return this.performRangedAttack(attacker, target, rangedAttackParams);
              } else if (rangedAttackParams.itemSubType === ItemSubType.Staff) {
                const attack = await this.battleAttackValidator.validateMagicAttack(character._id, {
                  targetId: target.id,
                  targetType: target.type as EntityType,
                });

                if (attack) {
                  return this.performRangedAttack(attacker, target, rangedAttackParams, true);
                }
                return attack;
              } else if (rangedAttackParams.itemSubType === ItemSubType.Ranged) {
                return this.performRangedAttack(attacker, target, rangedAttackParams);
              }
            } else {
              return this.performRangedAttack(attacker, target, rangedAttackParams);
            }
          }
          break;
        }

        case EntityAttackType.MeleeRanged: {
          if (attacker.type === EntityType.Character) {
            throw new Error(`Character cannot have MeleeRanged hybrid attack type. Character id ${attacker.id}`);
          }

          const isUnderMeleeRange = this.movementHelper.isUnderRange(attacker.x, attacker.y, target.x, target.y, 1);

          if (isUnderMeleeRange) {
            await this.hitTarget.hit(attacker, target);
            return true;
          } else {
            const rangedAttackParams = await this.battleAttackValidator.validateAttack(attacker, target);

            if (rangedAttackParams) {
              return this.performRangedAttack(attacker, target, rangedAttackParams);
            }
          }
          break;
        }

        default: {
          return false;
        }
      }

      const isTargetClose = this.movementHelper.isUnderRange(
        attacker.x,
        attacker.y,
        target.x,
        target.y,
        (SOCKET_TRANSMISSION_ZONE_WIDTH * 2) / GRID_WIDTH / 2
      );

      if (!isTargetClose) {
        if (attacker.type === EntityType.Character) {
          const character = attacker as ICharacter;
          await this.battleNetworkStopTargeting.stopTargeting(character);
          await this.battleCycleManager.stopBattleCycle(character._id);

          this.socketMessaging.sendEventToUser<IBattleCancelTargeting>(
            character.channelId!,
            BattleSocketEvents.CancelTargeting,
            {
              targetId: target.id,
              type: target.type as EntityType,
              reason: "Your battle target was lost.",
            }
          );
        }

        if (attacker.type === EntityType.NPC) {
          const npc = attacker as INPC;
          await this.npcTarget.tryToClearOutOfRangeTargets(npc);
        }

        return false;
      }

      return true;
    } finally {
      await this.locker.unlock(lockKey);
    }
  }

  public async clearCharacterBattleTarget(character: ICharacter): Promise<void> {
    if (character.target?.id && character.target?.type) {
      const targetId = character.target.id as unknown as string;
      const targetType = character.target.type as unknown as EntityType;
      const targetReason = "Your battle target was lost.";

      const dataOfCancelTargeting: IBattleCancelTargeting = {
        targetId: targetId,
        type: targetType,
        reason: targetReason,
      };

      this.socketMessaging.sendEventToUser<IBattleCancelTargeting>(
        character.channelId!,
        BattleSocketEvents.CancelTargeting,
        dataOfCancelTargeting
      );

      await this.battleNetworkStopTargeting.stopTargeting(character);
      await this.battleCycleManager.stopBattleCycle(character._id);
    }
  }

  @TrackNewRelicTransaction()
  private async performRangedAttack(
    attacker: ICharacter | INPC,
    target: ICharacter | INPC,
    rangedAttackParams: any,
    magicAttack = false
  ): Promise<boolean> {
    await this.hitTarget.hit(attacker, target, magicAttack);
    await this.battleRangedAttack.sendRangedAttackEvent(attacker, target, rangedAttackParams);
    if (attacker.type === EntityType.Character && rangedAttackParams.itemSubType === ItemSubType.Ranged) {
      await this.battleRangedAttack.consumeAmmo(rangedAttackParams, attacker as ICharacter);
    }
    return true;
  }
}
