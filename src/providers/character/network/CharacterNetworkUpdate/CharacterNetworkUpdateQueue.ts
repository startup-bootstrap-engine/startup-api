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

import { NewRelic } from "@providers/analytics/NewRelic";
import { MAX_PING_TRACKING_THRESHOLD } from "@providers/constants/ServerConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MapTransitionNonPVPZone } from "@providers/map/MapTransition/MapTransitionNonPvpZone";
import { MapTransitionQueue } from "@providers/map/MapTransition/MapTransitionQueue";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import dayjs from "dayjs";
import random from "lodash/random";
import { CharacterMovementValidation } from "../../characterMovement/CharacterMovementValidation";
import { CharacterMovementWarn } from "../../characterMovement/CharacterMovementWarn";

@provideSingleton(CharacterNetworkUpdateQueue)
export class CharacterNetworkUpdateQueue {
  constructor(
    private socketMessaging: SocketMessaging,
    private socketAuth: SocketAuth,
    private movementHelper: MovementHelper,
    private npcManager: NPCManager,
    private gridManager: GridManager,
    private characterMovementValidation: CharacterMovementValidation,
    private characterMovementWarn: CharacterMovementWarn,
    private mathHelper: MathHelper,
    private newRelic: NewRelic,
    private locker: Locker,
    private mapTransition: MapTransitionQueue,
    private dynamicQueue: DynamicQueue,
    private mapTransitionNonPVPZone: MapTransitionNonPVPZone
  ) {}

  public onCharacterUpdatePosition(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      CharacterSocketEvents.CharacterPositionUpdate,
      async (data: ICharacterPositionUpdateFromClient, character: ICharacter) => {
        try {
          await this.addToQueue(data, character);
        } catch (error) {
          console.error(error);
        }
      }
    );
  }

  public async addToQueue(data: ICharacterPositionUpdateFromClient, character: ICharacter): Promise<void> {
    await this.dynamicQueue.addJob(
      "character-network-update",
      (job) => {
        const { character, data } = job.data;

        //! Using await here is related with the "Teleport bug"
        void this.execPositionUpdate(data, character);
      },
      {
        character,
        data,
      },
      undefined
    );
  }

  private async execPositionUpdate(data: ICharacterPositionUpdateFromClient, character: ICharacter): Promise<void> {
    const hasLock = await this.locker.lock(`character-network-update-${character._id}`);

    if (!hasLock) {
      return;
    }

    try {
      if (await this.isCharacterChangingScene(character)) {
        return;
      }

      if (!data) {
        return;
      }

      const isMoving = this.determineCharacterMovement(character, data);
      this.trackPing(data);

      const isPositionUpdateValid = isMoving
        ? await this.characterMovementValidation.isValid(character, data.newX, data.newY, isMoving)
        : true;

      if (!isPositionUpdateValid) {
        this.sendConfirmation(character, data.direction, false);
        return;
      }

      await this.processValidCharacterMovement(character, data, isMoving);
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`character-network-update-${character._id}`);
    }
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }

  private async isCharacterChangingScene(character: ICharacter): Promise<boolean> {
    return await this.locker.hasLock(`character-changing-scene-${character._id}`);
  }

  private determineCharacterMovement(character: ICharacter, data: ICharacterPositionUpdateFromClient): boolean {
    return this.movementHelper.isMoving(character.x, character.y, data.newX, data.newY);
  }

  private async processValidCharacterMovement(
    character: ICharacter,
    data: ICharacterPositionUpdateFromClient,
    isMoving: boolean
  ): Promise<void> {
    await this.syncIfPositionMismatch(character, { x: character.x, y: character.y }, data.originX, data.originY);

    this.characterMovementWarn.warn(character, data);
    await this.npcManager.startBehaviorLoopUsingMicroservice(character);
    await this.updateServerSideEmitterInfo(character, data.newX, data.newY, isMoving, data.direction);
    void this.mapTransitionNonPVPZone.handleNonPVPZone(character, data.newX, data.newY);
    await this.mapTransition.handleMapTransition(character, data.newX, data.newY);
    this.sendConfirmation(character, data.direction, true);
  }

  private trackPing(data: ICharacterPositionUpdateFromClient): void {
    const { timestamp } = data;

    if (timestamp) {
      const n = random(1, 100);

      if (n <= 10) {
        // 10% chance tracking ping
        const ping = dayjs().diff(dayjs(timestamp), "ms");

        if (ping < 0 || ping > MAX_PING_TRACKING_THRESHOLD) {
          return; // invalid ping
        }

        this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Characters, "Character/Ping", ping);
      }
    }
  }

  private sendConfirmation(character: ICharacter, direction: AnimationDirection, isPositionUpdateValid: boolean): void {
    // lets make sure we send the confirmation back to the user only after all the other pre-requirements above are done.
    this.socketMessaging.sendEventToUser<ICharacterPositionUpdateConfirm>(
      character.channelId!,
      CharacterSocketEvents.CharacterPositionUpdateConfirm,
      {
        id: character._id,
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
      await this.gridManager.setWalkable(map, ToGridX(character.x), ToGridY(character.y), true);

      await Character.updateOne(
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
      await this.gridManager.setWalkable(map, ToGridX(newX), ToGridY(newY), false);
    }
  }
}
