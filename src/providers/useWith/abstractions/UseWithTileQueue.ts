import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { TILE_MAX_REACH_DISTANCE_IN_GRID } from "@providers/constants/TileConstants";
import { blueprintManager } from "@providers/inversify/container";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
import { itemsBlueprintIndex } from "@providers/item/data/index";
import { MapTiles } from "@providers/map/MapTiles";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import {
  IRefillableItem,
  IUseWithTile,
  IUseWithTileValidation,
  ItemSubType,
  MAP_LAYERS_TO_ID,
  ToGridX,
  ToGridY,
  UseWithSocketEvents,
} from "@rpg-engine/shared";
import { UseWithHelper } from "../libs/UseWithHelper";
import { IItemUseWith, IUseWithTileValidationResponse } from "../useWithTypes";

@provideSingleton(UseWithTileQueue)
export class UseWithTileQueue {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private mapTiles: MapTiles,
    private useWithHelper: UseWithHelper,
    private movementHelper: MovementHelper,
    private itemCraftable: ItemCraftableQueue,
    private skillIncrease: SkillIncrease,
    private dynamicQueue: DynamicQueue
  ) {}

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

  public async addToQueue(useWithTileData: IUseWithTile, character: ICharacter): Promise<void> {
    await this.dynamicQueue.addJob(
      "use-with-tile",
      async (job) => {
        const { useWithTileData, character } = job.data;

        return await this.onExecuteUseWithTile(character, useWithTileData);
      },
      {
        character,
        useWithTileData,
      }
    );
  }

  @TrackNewRelicTransaction()
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

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
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

    const isValid = this.useWithHelper.basicValidations(character, data);

    if (!isValid) {
      return;
    }

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

    if (tileId === undefined) {
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

      const originItemBlueprint = blueprintManager.getBlueprint("items", originItem.baseKey) as Record<string, unknown>;

      if (originItem.baseKey !== useWithKey && originItemBlueprint?.toolCategory !== useWithKey) {
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
