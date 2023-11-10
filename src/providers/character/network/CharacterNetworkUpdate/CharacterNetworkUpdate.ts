/* eslint-disable no-void */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { GridManager } from "@providers/map/GridManager";
import { MathHelper } from "@providers/math/MathHelper";
import { IPosition, MovementHelper } from "@providers/movement/MovementHelper";
import { NPCManager } from "@providers/npc/NPCManager";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import {
  AnimationDirection,
  CharacterSocketEvents,
  GRID_WIDTH,
  ICharacterPositionUpdateConfirm,
  ICharacterPositionUpdateFromClient,
  ICharacterSyncPosition,
  ToGridX,
  ToGridY,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

import { NewRelic } from "@providers/analytics/NewRelic";
import { MAX_PING_TRACKING_THRESHOLD } from "@providers/constants/ServerConstants";
import { Locker } from "@providers/locks/Locker";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import dayjs from "dayjs";
import random from "lodash/random";
import { CharacterView } from "../../CharacterView";
import { CharacterMovementValidation } from "../../characterMovement/CharacterMovementValidation";
import { CharacterMovementWarn } from "../../characterMovement/CharacterMovementWarn";
import { CharacterNetworkUpdateMapManager } from "./CharacterNetworkUpdateMap";

@provide(CharacterNetworkUpdate)
export class CharacterNetworkUpdate {
  constructor(
    private socketMessaging: SocketMessaging,
    private socketAuth: SocketAuth,
    private movementHelper: MovementHelper,

    private npcManager: NPCManager,
    private gridManager: GridManager,
    private characterMovementValidation: CharacterMovementValidation,
    private characterMovementWarn: CharacterMovementWarn,
    private mathHelper: MathHelper,
    private characterView: CharacterView,
    private newRelic: NewRelic,
    private locker: Locker,
    private characterNetworkUpdateMapManager: CharacterNetworkUpdateMapManager
  ) {}

  public onCharacterUpdatePosition(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      CharacterSocketEvents.CharacterPositionUpdate,
      async (data: ICharacterPositionUpdateFromClient, character: ICharacter) => {
        try {
          const isChangingScene = await this.locker.hasLock(`character-changing-scene-${character._id}`);

          // avoid sending network updates if the character is changing between scenes
          if (isChangingScene) {
            return;
          }

          if (data) {
            // sometimes the character is just changing facing direction and not moving.. That's why we need this.
            const isMoving = this.movementHelper.isMoving(character.x, character.y, data.newX, data.newY);

            // send message back to the user telling that the requested position update is not valid!

            let isPositionUpdateValid = true;

            const { newX, newY, timestamp } = data;

            if (timestamp) {
              const n = random(1, 100);

              if (n <= 10) {
                // 10% chance tracking ping
                const ping = dayjs().diff(dayjs(timestamp), "ms");

                if (ping < 0 || ping > MAX_PING_TRACKING_THRESHOLD) {
                  return; // invalid ping
                }

                this.newRelic.trackMetric(
                  NewRelicMetricCategory.Count,
                  NewRelicSubCategory.Characters,
                  "Character/Ping",
                  ping
                );
              }
            }

            if (isMoving) {
              isPositionUpdateValid = await this.characterMovementValidation.isValid(character, newX, newY, isMoving);
            }

            if (isPositionUpdateValid) {
              const serverCharacterPosition = {
                x: character.x,
                y: character.y,
              };

              await this.syncIfPositionMismatch(character, serverCharacterPosition, data.originX, data.originY);

              void this.characterMovementWarn.warn(character, data);

              void this.npcManager.startNearbyNPCsBehaviorLoop(character);
              await this.updateServerSideEmitterInfo(character, newX, newY, isMoving, data.direction);

              void this.characterNetworkUpdateMapManager.handleNonPVPZone(character, newX, newY);

              // leave it for last!
              void this.characterNetworkUpdateMapManager.handleMapTransition(character, newX, newY);

              void this.characterView.clearAllOutOfViewElements(character._id, character.x, character.y);
            }

            this.sendConfirmation(character, data.direction, isPositionUpdateValid);
          }
        } catch (error) {
          console.error(error);
        }
      }
    );
  }

  private sendConfirmation(character: ICharacter, direction: AnimationDirection, isPositionUpdateValid: boolean): void {
    // lets make sure we send the confirmation back to the user only after all the other pre-requirements above are done.
    this.socketMessaging.sendEventToUser<ICharacterPositionUpdateConfirm>(
      character.channelId!,
      CharacterSocketEvents.CharacterPositionUpdateConfirm,
      {
        id: character.id,
        isValid: isPositionUpdateValid,
        position: {
          originX: character.x,
          originY: character.y,
          direction: direction,
        },
      }
    );
  }

  private async syncIfPositionMismatch(
    serverCharacter: ICharacter,
    serverCharacterPosition: IPosition,
    clientOriginX: number,
    clientOriginY: number
  ): Promise<void> {
    const distance = this.mathHelper.getDistanceInGridCells(
      serverCharacterPosition.x,
      serverCharacterPosition.y,
      clientOriginX,
      clientOriginY
    );

    const distanceInGridCells = Math.round(distance / GRID_WIDTH);

    if (distanceInGridCells >= 1) {
      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Characters,
        "Desync/GridDesyncDistanceInCells",
        distanceInGridCells
      );

      await Character.updateOne(
        { id: serverCharacter.id },
        {
          x: clientOriginX,
          y: clientOriginY,
        }
      ).lean();
    }

    if (distanceInGridCells >= 10) {
      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Characters,
        "Desync/GridDesyncHighDistanceInCells",
        distanceInGridCells
      );

      this.socketMessaging.sendEventToUser<ICharacterSyncPosition>(
        serverCharacter.channelId!,
        CharacterSocketEvents.CharacterSyncPosition,
        {
          id: serverCharacter.id,
          position: {
            originX: serverCharacter.x,
            originY: serverCharacter.y,
            direction: serverCharacter.direction as AnimationDirection,
          },
        }
      );
    }
  }

  private async updateServerSideEmitterInfo(
    character: ICharacter,
    newX: number,
    newY: number,
    isMoving: boolean,
    direction: AnimationDirection
  ): Promise<void> {
    const map = character.scene;

    if (isMoving) {
      // if character is moving, update the position

      // old position is now walkable
      const setOldPositionWalkable = this.gridManager.setWalkable(
        map,
        ToGridX(character.x),
        ToGridY(character.y),
        true
      );

      const characterUpdate = Character.updateOne(
        { _id: character._id },
        {
          $set: {
            x: newX,
            y: newY,
            direction: direction,
            lastMovement: new Date(),
          },
        }
      ).lean();

      // update our grid with solid information
      const setNewPositionSolid = this.gridManager.setWalkable(map, ToGridX(newX), ToGridY(newY), false);

      await Promise.all([setOldPositionWalkable, characterUpdate, setNewPositionSolid]);
    }
  }
}
