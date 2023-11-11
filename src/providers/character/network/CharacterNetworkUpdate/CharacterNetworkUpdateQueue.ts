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
  EnvType,
  GRID_WIDTH,
  ICharacterPositionUpdateConfirm,
  ICharacterPositionUpdateFromClient,
  ICharacterSyncPosition,
  ToGridX,
  ToGridY,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

import { NewRelic } from "@providers/analytics/NewRelic";
import { appEnv } from "@providers/config/env";
import { MAX_PING_TRACKING_THRESHOLD } from "@providers/constants/ServerConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { Locker } from "@providers/locks/Locker";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { Queue, Worker } from "bullmq";
import dayjs from "dayjs";
import random from "lodash/random";
import { v4 as uuidv4 } from "uuid";
import { CharacterView } from "../../CharacterView";
import { CharacterMovementValidation } from "../../characterMovement/CharacterMovementValidation";
import { CharacterMovementWarn } from "../../characterMovement/CharacterMovementWarn";
import { CharacterNetworkUpdateMapManager } from "./CharacterNetworkUpdateMap";
@provide(CharacterNetworkUpdateQueue)
export class CharacterNetworkUpdateQueue {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;
  private queueName: string = `character-network-update-${uuidv4()}-${
    appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id
  }`;

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
    private characterNetworkUpdateMapManager: CharacterNetworkUpdateMapManager,
    private redisManager: RedisManager
  ) {}

  public initQueue(): void {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue(this.queueName, {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.queue.on("error", async (error) => {
          console.error(`Error in the ${this.queueName}:`, error);

          await this.queue?.close();
          this.queue = null;
        });
      }
    }

    if (!this.worker) {
      this.worker = new Worker(
        this.queueName,
        async (job) => {
          const { character, data } = job.data;

          try {
            await this.handlePositionUpdateRequest(data, character);
          } catch (err) {
            console.error(`Error processing ${this.queueName} for Character ${character.name}:`, err);
            throw err;
          }
        },
        {
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.log(`${this.queueName} job ${job?.id} failed with error ${err.message}`);

          await this.worker?.close();
          this.worker = null;
        });
      }
    }
  }

  public async clearAllJobs(): Promise<void> {
    if (!this.connection || !this.queue || !this.worker) {
      this.initQueue();
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

  public async addToQueue(data: ICharacterPositionUpdateFromClient, character: ICharacter): Promise<void> {
    if (!this.connection || !this.queue || !this.worker) {
      this.initQueue();
    }

    await this.queue?.add(
      this.queueName,
      {
        data,
        character,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

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

  private async handlePositionUpdateRequest(
    data: ICharacterPositionUpdateFromClient,
    character: ICharacter
  ): Promise<void> {
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
    void this.npcManager.startNearbyNPCsBehaviorLoop(character);
    await this.updateServerSideEmitterInfo(character, data.newX, data.newY, isMoving, data.direction);
    void this.characterNetworkUpdateMapManager.handleNonPVPZone(character, data.newX, data.newY);
    void this.characterNetworkUpdateMapManager.handleMapTransition(character, data.newX, data.newY);
    void this.characterView.clearAllOutOfViewElements(character._id, character.x, character.y);
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
