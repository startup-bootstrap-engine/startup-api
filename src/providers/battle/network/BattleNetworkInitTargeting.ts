import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { Locker } from "@providers/locks/Locker";
import { MapNonPVPZone } from "@providers/map/MapNonPVPZone";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { Stealth } from "@providers/spells/data/logic/rogue/Stealth";
import { Time } from "@providers/time/Time";
import {
  BattleSocketEvents,
  GRID_WIDTH,
  IBattleCancelTargeting,
  IBattleInitTargeting,
  NPCAlignment,
  SOCKET_TRANSMISSION_ZONE_WIDTH,
} from "@rpg-engine/shared";
import { EntityType } from "@rpg-engine/shared/dist/types/entity.types";
import { provide } from "inversify-binding-decorators";
import { random } from "lodash";
import { BattleCharacterAttack } from "../BattleCharacterAttack/BattleCharacterAttack";

interface ITargetValidation {
  isValid: boolean;
  reason?: string;
}

@provide(BattleNetworkInitTargeting)
export class BattleNetworkInitTargeting {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private movementHelper: MovementHelper,
    private battleCharacterManager: BattleCharacterAttack,
    private mapNonPVPZone: MapNonPVPZone,
    private stealth: Stealth,
    private locker: Locker,
    private time: Time
  ) {}

  public onBattleInitTargeting(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      BattleSocketEvents.InitTargeting,
      async (data: IBattleInitTargeting, character: ICharacter) => {
        await this.time.waitForMilliseconds(random(1, 50));

        const hasLocked = await this.locker.lock(`character-${character._id}-battle-targeting`);

        // if it fails to lock thats because the character is already targeting, so lets clear it.
        if (!hasLocked) {
          return;
        }

        try {
          let target: INPC | ICharacter | null = null;

          if (data.type === EntityType.NPC) {
            // eslint-disable-next-line mongoose-lean/require-lean
            target = await NPC.findOne({
              _id: data.targetId,
            });
          }

          if (data.type === EntityType.Character) {
            // eslint-disable-next-line mongoose-lean/require-lean
            target = await Character.findOne({
              _id: data.targetId,
            });
          }

          if (!target || target.health === 0) {
            this.socketMessaging.sendEventToUser<IBattleCancelTargeting>(
              character.channelId!,
              BattleSocketEvents.CancelTargeting,
              {
                targetId: data.targetId,
                type: data.type,
              }
            );

            console.debug(`Failed to set target on NPC ${data.targetId}`);
            return;
          }

          const isValidTarget = await this.isValidTarget(target, character);

          if (!isValidTarget.isValid) {
            console.log(
              `${character.name} is trying to set a target to ${target.name} but it's not valid. Reason: ${isValidTarget.reason}`
            );
            this.socketMessaging.sendEventToUser<IBattleCancelTargeting>(
              character.channelId!,
              BattleSocketEvents.CancelTargeting,
              {
                targetId: data.targetId,
                type: data.type,
                reason: isValidTarget.reason,
              }
            );
            return;
          }

          await this.characterSetTargeting(character, target, data.type);

          // validate if character actually can set this target
        } catch (error) {
          console.error(error);
          await this.locker.unlock(`character-${character._id}-battle-targeting`);
          throw error;
        }
      }
    );
  }

  private async characterSetTargeting(
    character: ICharacter,
    target: ICharacter | INPC,
    targetType: EntityType
  ): Promise<void> {
    if (character.target?.id?.toString() === target?._id?.toString()) {
      // avoid setting target again
      return;
    }

    await Character.updateOne(
      { _id: character._id },
      {
        $set: {
          target: {
            id: target._id,
            // @ts-ignore
            type: targetType,
          },
        },
      }
    );

    await this.battleCharacterManager.onHandleCharacterBattleLoop(character, target);
  }

  private async isValidTarget(target: INPC | ICharacter | null, character: ICharacter): Promise<ITargetValidation> {
    // check if target is within character range.
    if (target?.id === character.id) {
      return {
        isValid: false,
        reason: "You cannot attack yourself.",
      };
    }

    if (target!.health === 0) {
      return {
        isValid: false,
        reason: "You cannot attack a target that's already dead.",
      };
    }

    if (character.health === 0) {
      return {
        isValid: false,
        reason: "You cannot attack when you're dead.",
      };
    }

    if (target!.scene !== character.scene) {
      return {
        isValid: false,
        reason: "Your target is not on the same scene.",
      };
    }

    // Apply specific validations by target type
    const specificTargetValidation = this.checkBySpecificType(target);
    if (!specificTargetValidation?.isValid) {
      return specificTargetValidation;
    }

    const isCharacterOnline = character.isOnline;
    if (!isCharacterOnline) {
      return {
        isValid: false,
        reason: "Offline targets are not allowed to set target!",
      };
    }

    /*
    Check character attack type. If melee, target should be within a 1 grid cell range. 
    If ranged, check max range.
    */

    const isUnderRange = this.movementHelper.isUnderRange(
      character.x,
      character.y,
      target!.x,
      target!.y,
      SOCKET_TRANSMISSION_ZONE_WIDTH / GRID_WIDTH
    );

    if (!isUnderRange) {
      return {
        isValid: false,
        reason: "Target is out of range.",
      };
    }

    if (target?.type === "NPC") {
      const npc = target as INPC;
      if (npc.alignment === NPCAlignment.Friendly) {
        return {
          isValid: false,
          reason: "Sorry, you cannot attack a friendly NPC.",
        };
      }
    }

    if (target && (await this.stealth.isInvisible(target))) {
      return {
        isValid: false,
        reason: "Sorry, your target is invisible.",
      };
    }

    return {
      isValid: true,
    };
  }

  private checkBySpecificType(target: INPC | ICharacter | null): ITargetValidation {
    if (target?.type === EntityType.NPC) return this.isValidNPCTarget(target as unknown as INPC);
    if (target?.type === EntityType.Character) return this.isValidCharacterTarget(target as unknown as ICharacter);

    return {
      isValid: true,
    };
  }

  private isValidNPCTarget(target: INPC): ITargetValidation {
    const isNonPVPZone = this.mapNonPVPZone.isNonPVPZoneAtXY(target.scene, target.x, target.y);

    if (isNonPVPZone && target.alignment === NPCAlignment.Friendly) {
      return {
        isValid: false,
        reason: "You cannot attack this entity.",
      };
    }

    return {
      isValid: true,
    };
  }

  private isValidCharacterTarget(target: ICharacter): ITargetValidation {
    const isNonPVPZone = this.mapNonPVPZone.isNonPVPZoneAtXY(target.scene, target.x, target.y);

    if (isNonPVPZone) {
      return {
        isValid: false,
        reason: "You cannot attack a target inside a Non-PVP Zone!",
      };
    }

    return {
      isValid: true,
    };
  }
}
