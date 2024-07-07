/* eslint-disable mongoose-lean/require-lean */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment } from "@entities/ModuleCharacter/EquipmentModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { EquipmentSlots } from "@providers/equipment/EquipmentSlots";
import { IPosition, MovementHelper } from "@providers/movement/MovementHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  FromGridX,
  FromGridY,
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  IItemDrop,
  ItemSocketEvents,
  ItemType,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { CharacterItems } from "../../character/characterItems/CharacterItems";

import { Locker } from "@providers/locks/Locker";
import { ItemOwnership } from "../ItemOwnership";
import { ItemDropValidator } from "./ItemDropValidator";
import { ItemDropVerifier } from "./ItemDropVerifier";

@provide(ItemDrop)
export class ItemDrop {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItems: CharacterItems,
    private equipmentSlots: EquipmentSlots,
    private movementHelper: MovementHelper,
    private characterWeight: CharacterWeightQueue,
    private itemOwnership: ItemOwnership,

    private inMemoryHashTable: InMemoryHashTable,
    private locker: Locker,
    private itemDropVerifier: ItemDropVerifier,
    private itemDropValidator: ItemDropValidator
  ) {}

  //! For now, only a drop from inventory or equipment set is allowed.
  @TrackNewRelicTransaction()
  public async performItemDrop(itemDropData: IItemDrop, character: ICharacter): Promise<boolean> {
    try {
      const isDropValid = await this.itemDropValidator.isItemDropValid(itemDropData, character);
      if (!isDropValid) {
        return false;
      }

      const isDropLocked = await this.locker.lock(`item-drop-${itemDropData.itemId}`);
      if (!isDropLocked) {
        return false;
      }

      const itemToBeDropped = await Item.findById(itemDropData.itemId);
      if (!itemToBeDropped) {
        this.sendErrorMessage(character, "Sorry, item to be dropped wasn't found.");
        return false;
      }

      const mapDrop = await this.tryDroppingToMap(itemDropData, itemToBeDropped, character);
      if (!mapDrop) {
        return false;
      }

      const isItemRemoved = await this.removeItemFromSource(itemDropData, itemToBeDropped, character);
      if (!isItemRemoved) {
        this.sendErrorMessage(character);
        return false;
      }

      await this.clearCharacterCache(character, itemDropData, itemToBeDropped);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      await this.locker.unlock(`item-drop-${itemDropData.itemId}`);
    }
  }

  private async clearCharacterCache(
    character: ICharacter,
    itemDropData: IItemDrop,
    itemToBeDropped: IItem
  ): Promise<void> {
    const promises = [
      clearCacheForKey(`${character._id}-equipment`),
      this.inMemoryHashTable.delete("equipment-slots", character._id),
      this.inMemoryHashTable.delete("character-weapon", character._id),
      this.inMemoryHashTable.delete("inventory-weight", character._id),
      this.inMemoryHashTable.delete("character-max-weights", character._id),
    ];

    if (itemToBeDropped.type === ItemType.CraftingResource) {
      promises.push(this.inMemoryHashTable.delete("load-craftable-items", character._id));
    }

    await Promise.all(promises);

    await this.characterWeight.updateCharacterWeight(character);
  }

  private async removeItemFromSource(
    itemDropData: IItemDrop,
    itemToBeDropped: IItem,
    character: ICharacter
  ): Promise<boolean> {
    const cachePromises = [
      clearCacheForKey(`${character._id}-inventory`),
      this.inMemoryHashTable.delete("container-all-items", itemDropData.fromContainerId),
    ];

    await Promise.all(cachePromises);

    let isItemRemoved = false;
    switch (itemDropData.source) {
      case "equipment":
        isItemRemoved = await this.removeItemFromEquipmentSet(itemToBeDropped, character);
        if (isItemRemoved) {
          const equipmentSlots = await this.equipmentSlots.getEquipmentSlots(
            character._id,
            character.equipment as string
          );
          this.sendRefreshItemsEvent({ equipment: equipmentSlots, openEquipmentSetOnUpdate: false }, character);
        }
        break;
      case "inventory":
        isItemRemoved = await this.removeItemFromInventory(itemToBeDropped, character, itemDropData.fromContainerId);
        if (isItemRemoved) {
          const inventoryContainer = (await ItemContainer.findById(
            itemDropData.fromContainerId
          )) as unknown as IItemContainer;
          const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
            inventory: inventoryContainer,
            openEquipmentSetOnUpdate: false,
            openInventoryOnUpdate: false,
          };
          this.sendRefreshItemsEvent(payloadUpdate, character);
        }
        break;
    }
    return isItemRemoved;
  }

  private sendErrorMessage(character: ICharacter, message?: string): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, message);
  }

  private async tryDroppingToMap(itemDrop: IItemDrop, dropItem: IItem, character: ICharacter): Promise<boolean> {
    try {
      // if itemDrop toPosition has x and y, then drop item to that position in the map, if not, then drop to the character position
      const targetPosition = this.getTargetPosition(itemDrop);

      // check if targetX and Y is under range
      if (!this.isDropPositionValid(character, targetPosition)) {
        this.sendDropErrorMessage(character);
        return false;
      }

      // update x, y, scene and unset owner, using updateOne
      await this.updateItemPosition(dropItem, targetPosition, character);

      // Perform cleanup, status update, and ownership removal concurrently
      await Promise.all([this.itemDropVerifier.trackDrop(character, dropItem._id), this.updateItemStatus(dropItem)]);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      await this.removeItemOwnership(dropItem);
    }
  }

  private getTargetPosition(itemDrop: IItemDrop): { x: number; y: number } {
    return {
      x: itemDrop.toPosition?.x || itemDrop.x,
      y: itemDrop.toPosition?.y || itemDrop.y,
    };
  }

  private isDropPositionValid(character: ICharacter, targetPosition: { x: number; y: number }): boolean {
    return this.movementHelper.isUnderRange(character.x, character.y, targetPosition.x, targetPosition.y, 8);
  }

  private sendDropErrorMessage(character: ICharacter): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you're trying to drop this item too far away.");
  }

  private async updateItemPosition(
    dropItem: IItem,
    targetPosition: { x: number; y: number },
    character: ICharacter
  ): Promise<void> {
    await Item.updateOne(
      { _id: dropItem._id },
      {
        $set: {
          x: targetPosition.x,
          y: targetPosition.y,
          scene: character.scene,
          isInContainer: false,
          updatedAt: new Date(), // explicitly update it, so we avoid the cron cleaner deleting items that are dropped just before the cron runs
        },
        $unset: {
          carrier: 1,
        },
      }
    );
  }

  private async updateItemStatus(dropItem: IItem): Promise<void> {
    await Item.updateOne({ _id: dropItem._id }, { isEquipped: false });
  }

  private async removeItemOwnership(dropItem: IItem): Promise<void> {
    await this.itemOwnership.removeItemOwnership(dropItem);
  }

  private async removeItemFromEquipmentSet(item: IItem, character: ICharacter): Promise<boolean> {
    const equipmentSetId = character.equipment;
    const equipmentSet = await Equipment.findById(equipmentSetId).cacheQuery({
      cacheKey: `${character._id}-equipment`,
    });

    if (!equipmentSet) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, equipment set not found.");
      return false;
    }

    const wasItemDeleted = await this.characterItems.deleteItemFromContainer(item._id, character, "equipment");

    if (!wasItemDeleted) {
      return false;
    }

    return true;
  }

  /**
   * This method will remove a item from the character inventory
   */
  private async removeItemFromInventory(item: IItem, character: ICharacter, fromContainerId: string): Promise<boolean> {
    const targetContainer = await ItemContainer.findById(fromContainerId);

    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character);
      return false;
    }

    if (!targetContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character);
      return false;
    }

    const wasItemDeleted = await this.characterItems.deleteItemFromContainer(item._id, character, "inventory");

    if (!wasItemDeleted) {
      return false;
    }

    return true;
  }

  @TrackNewRelicTransaction()
  public async dropItems(items: IItem[], droppintPoints: IPosition[], scene: string): Promise<void> {
    for (const i in droppintPoints) {
      items[i].x = FromGridX(droppintPoints[i].x);
      items[i].y = FromGridY(droppintPoints[i].y);
      items[i].scene = scene;

      await items[i].save();
    }
  }

  private sendRefreshItemsEvent(payloadUpdate: IEquipmentAndInventoryUpdatePayload, character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }
}
