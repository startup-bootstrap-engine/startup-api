import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { appEnv } from "@providers/config/env";
import { TILE_MAX_REACH_DISTANCE_IN_GRID } from "@providers/constants/TileConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { ItemCraftable } from "@providers/item/ItemCraftable";
import { itemsBlueprintIndex } from "@providers/item/data/index";
import { MapTiles } from "@providers/map/MapTiles";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import {
  EnvType,
  IRefillableItem,
  IUseWithTile,
  IUseWithTileValidation,
  ItemSubType,
  MAP_LAYERS_TO_ID,
  ToGridX,
  ToGridY,
  UseWithSocketEvents,
} from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import { provide } from "inversify-binding-decorators";
import { v4 as uuidv4 } from "uuid";
import { UseWithHelper } from "../libs/UseWithHelper";
import { IItemUseWith, IUseWithTileValidationResponse } from "../useWithTypes";

@provide(UseWithTileQueue)
export class UseWithTileQueue {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;
  private queueName: string = `use-with-tile-${uuidv4()}-${
    appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id
  }`;

  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private mapTiles: MapTiles,
    private useWithHelper: UseWithHelper,
    private movementHelper: MovementHelper,
    private itemCraftable: ItemCraftable,
    private skillIncrease: SkillIncrease,
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
          const { character, useWithTileData } = job.data;

          try {
            await this.onExecuteUseWithTile(character, useWithTileData);
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

  public async onExecuteUseWithTile(character: ICharacter, useWithTileData: IUseWithTile): Promise<void> {
    const useWithData = await this.validateData(character, useWithTileData);

    if (useWithData) {
      const { originItem, useWithTileEffect, targetName } = useWithData;

      await useWithTileEffect!(
        originItem,
        useWithTileData.targetTile,
        targetName,
        character,
        this.itemCraftable,
        this.skillIncrease
      );
    }
    if (!useWithData || useWithData.originItem.subType !== ItemSubType.Tool || useWithData.originItem.isRefillable) {
      this.socketMessaging.sendEventToUser<IUseWithTileValidation>(
        character.channelId!,
        UseWithSocketEvents.UseWithTileValidation,
        { status: false }
      );
    }
  }

  public async addToQueue(useWithTileData: IUseWithTile, character: ICharacter): Promise<void> {
    if (!this.connection || !this.queue || !this.worker) {
      this.initQueue();
    }

    await this.queue?.add(
      this.queueName,
      {
        character,
        useWithTileData,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  public async shutdown(): Promise<void> {
    await this.queue?.close();
    await this.worker?.close();

    this.queue = null;
    this.worker = null;
  }

  public async clearAllJobs(): Promise<void> {
    try {
      if (!this.queue) {
        this.initQueue();
      }

      const jobs = (await this.queue?.getJobs(["waiting", "active", "delayed", "paused"])) ?? [];
      for (const job of jobs) {
        await job?.remove();
      }
    } catch (error) {
      console.error(error);
    }
  }

  public onUseWithTile(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      UseWithSocketEvents.UseWithTile,
      async (useWithTileData: IUseWithTile, character) => {
        try {
          await this.addToQueue(useWithTileData, character);
        } catch (error) {
          console.error(error);
        }
      }
    );
  }

  /**
   * Validates the input data and returns the IValidUseWithResponse based on the item and tile passed on data field
   * @param character
   * @param data
   * @returns IValidUseWithResponse with the item that can be used with the tile and the useWithEffect function defined for it
   */
  private async validateData(
    character: ICharacter,
    data: IUseWithTile
  ): Promise<IUseWithTileValidationResponse | undefined> {
    // Check if character is alive and not banned

    this.useWithHelper.basicValidations(character, data);

    // Check if the character has the originItem
    const originItem = await this.useWithHelper.getItem(character, data.originItemId);

    const itemBlueprint = itemsBlueprintIndex[originItem.baseKey] as Partial<IItemUseWith>;

    // Check if tile position is at character's reach
    const isUnderRange = this.movementHelper.isUnderRange(
      character.x,
      character.y,
      data.targetTile.x,
      data.targetTile.y,
      itemBlueprint.useWithMaxDistanceGrid || TILE_MAX_REACH_DISTANCE_IN_GRID
    );
    if (!isUnderRange) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, the selected tile is out of reach.");
      return;
    }
    // check if tile exists
    const tileId = this.mapTiles.getTileId(
      data.targetTile.map,
      ToGridX(data.targetTile.x),
      ToGridY(data.targetTile.y),
      MAP_LAYERS_TO_ID[data.targetTile.layer]
    );

    if (!tileId) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, the selected tile doesn't exist.");
      return;
    }

    if (originItem.isRefillable) {
      const useWithRefill = this.mapTiles.getPropertyFromLayer(
        data.targetTile.map,
        ToGridX(data.targetTile.x),
        ToGridY(data.targetTile.y),
        MAP_LAYERS_TO_ID[data.targetTile.layer],
        "refill_resource"
      );

      if (!useWithRefill) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, this tile cannot be used with the refill item provided"
        );
        return;
      }

      const blueprintRefill = itemBlueprint as IRefillableItem;

      if (useWithRefill !== blueprintRefill.refillResourceKey) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Invalid refill resource. Expected ${blueprintRefill.refillResourceKey}, got ${useWithRefill}`
        );
        return;
      }
    } else {
      // Check if tile has useWithKey defined
      const useWithKey = this.mapTiles.getPropertyFromLayer(
        data.targetTile.map,
        ToGridX(data.targetTile.x),
        ToGridY(data.targetTile.y),
        MAP_LAYERS_TO_ID[data.targetTile.layer],
        "usewith_origin_item_key"
      );
      if (!useWithKey) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, this tile cannot be used with the item provided"
        );
        return;
      }

      if (originItem.baseKey !== useWithKey) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Invalid item to use with tile. It should be a '${useWithKey}', but the selected item is a '${originItem.baseKey}'!`
        );
        return;
      }
    }

    const useWithTargetName = this.mapTiles.getPropertyFromLayer(
      data.targetTile.map,
      ToGridX(data.targetTile.x),
      ToGridY(data.targetTile.y),
      MAP_LAYERS_TO_ID[data.targetTile.layer],
      "usewith_target_item_key"
    );

    const useWithTileEffect = itemBlueprint.useWithTileEffect;

    if (!useWithTileEffect) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `Item '${originItem.baseKey}' cannot be used with tiles...`
      );
      throw new Error(
        `UseWithTile > originItem '${originItem.baseKey}' does not have a useWithTileEffect function defined`
      );
    }

    return { originItem, useWithTileEffect, targetName: useWithTargetName };
  }
}
