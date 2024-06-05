import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IEquipmentAndInventoryUpdatePayload, IItemPickup } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

import { IItem } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { Locker } from "@providers/locks/Locker";
import { MapHelper } from "@providers/map/MapHelper";
import { clearCacheForKey } from "speedgoose";
import { ItemOwnership } from "../ItemOwnership";
import { ItemPickupFromContainer } from "./ItemPickupFromContainer";
import { ItemPickupFromMap } from "./ItemPickupFromMap";
import { ItemPickupUpdater } from "./ItemPickupUpdater";
import { ItemPickupValidator } from "./ItemPickupValidator";
@provide(ItemPickup)
export class ItemPickup {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemContainer: CharacterItemContainer,
    private itemPickupFromContainer: ItemPickupFromContainer,
    private itemPickupValidator: ItemPickupValidator,
    private itemPickupMapContainer: ItemPickupFromMap,
    private characterInventory: CharacterInventory,
    private itemPickupUpdater: ItemPickupUpdater,
    private mapHelper: MapHelper,
    private inMemoryHashTable: InMemoryHashTable,
    private locker: Locker,
    private itemOwnership: ItemOwnership
  ) {}

  @TrackNewRelicTransaction()
  public async performItemPickup(itemPickupData: IItemPickup, character: ICharacter): Promise<boolean | undefined> {
    try {
      const isPickupLocked = await this.locker.lock(`item-pickup-${itemPickupData.itemId}`);

      if (!isPickupLocked) {
        return false;
      }

      if (itemPickupData.fromContainerId) {
        await this.cleanupCache(character, itemPickupData.fromContainerId);
      }

      const itemToBePicked = await this.validateItemPickup(itemPickupData, character);
      if (!itemToBePicked) return false;

      const isPickupFromMap = this.isPickupFromMap(itemToBePicked);
      const isPickupFromContainer = this.isPickupFromContainer(itemPickupData, isPickupFromMap);

      itemToBePicked.key = itemToBePicked.baseKey;

      const inventory = await this.prepareItemAndFetchInventory(itemPickupData, character);
      const isInventoryItem = itemToBePicked.isItemContainer && inventory === null;

      if (isPickupFromContainer && !(await this.handlePickupFromContainer(itemPickupData, itemToBePicked, character))) {
        return false;
      }

      if (isPickupFromMap && !(await this.handlePickupFromMap(itemToBePicked, character))) {
        return false;
      }

      if (!(await this.handleAddToContainer(itemToBePicked, character, itemPickupData, isInventoryItem))) {
        return false;
      }

      if (isInventoryItem) {
        await this.handleInventoryItem(itemToBePicked, character);
        return true;
      }

      if (!itemPickupData.fromContainerId && !isInventoryItem && !isPickupFromMap) {
        this.sendErrorMessage(character);
        return false;
      }

      if (!(await this.updateContainers(itemPickupData, character, isPickupFromMap))) {
        return false;
      }

      await this.itemPickupUpdater.finalizePickup(itemToBePicked, character);
      return true;
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`item-pickup-${itemPickupData.itemId}`);
    }
  }

  private async cleanupCache(character: ICharacter, fromContainerId: string): Promise<void> {
    const promises = [
      clearCacheForKey(`${character._id}-inventory`),
      clearCacheForKey(`${character._id}-equipment`),
      this.inMemoryHashTable.delete("equipment-slots", character._id),
      this.inMemoryHashTable.delete("inventory-weight", character._id),
      this.inMemoryHashTable.delete("character-max-weights", character._id),
      this.inMemoryHashTable.delete("container-all-items", fromContainerId),
    ];

    await Promise.all(promises);
  }

  private async validateItemPickup(itemPickupData: IItemPickup, character: ICharacter): Promise<IItem | null> {
    const itemToBePicked = (await this.itemPickupValidator.isItemPickupValid(itemPickupData, character)) as IItem;
    if (!itemToBePicked) {
      return null;
    }
    return itemToBePicked;
  }

  private isPickupFromMap(itemToBePicked: IItem): boolean {
    return (
      this.mapHelper.isCoordinateValid(itemToBePicked.x) &&
      this.mapHelper.isCoordinateValid(itemToBePicked.y) &&
      itemToBePicked.scene !== undefined
    );
  }

  private isPickupFromContainer(itemPickupData: IItemPickup, isPickupFromMap: boolean): boolean {
    if (itemPickupData && itemPickupData.fromContainerId && !isPickupFromMap) {
      return true;
    }
    return false;
  }

  private async prepareItemAndFetchInventory(
    itemPickupData: IItemPickup,
    character: ICharacter
  ): Promise<IItem | null> {
    if (itemPickupData.toContainerId) {
      await this.inMemoryHashTable.delete("container-all-items", itemPickupData.toContainerId);
    }

    const inventory = await this.characterInventory.getInventory(character);

    if (!inventory) {
      return null;
    }

    return inventory;
  }

  private async handlePickupFromMap(itemToBePicked: IItem, character: ICharacter): Promise<boolean> {
    const pickupFromMap = await this.itemPickupMapContainer.pickupFromMapContainer(itemToBePicked, character);
    return pickupFromMap;
  }

  private async handleAddToContainer(
    itemToBePicked: IItem,
    character: ICharacter,
    itemPickupData: IItemPickup,
    isInventoryItem: boolean
  ): Promise<boolean> {
    const addToContainer = await this.characterItemContainer.addItemToContainer(
      itemToBePicked,
      character,
      itemPickupData.toContainerId,
      {
        isInventoryItem,
        shouldAddOwnership: true,
      }
    );
    return addToContainer;
  }

  private async handleInventoryItem(itemToBePicked: IItem, character: ICharacter): Promise<void> {
    // make sure to add ownership
    await this.itemOwnership.addItemOwnership(itemToBePicked, character);

    await this.itemPickupUpdater.refreshEquipmentIfInventoryItem(character);
    await this.itemPickupUpdater.finalizePickup(itemToBePicked, character);
  }

  private sendErrorMessage(character: ICharacter): void {
    this.socketMessaging.sendErrorMessageToCharacter(
      character,
      "Sorry, failed to remove item from container. Origin container not found."
    );
  }

  private async handlePickupFromContainer(
    itemPickupData: IItemPickup,
    itemToBePicked: IItem,
    character: ICharacter
  ): Promise<boolean> {
    const pickupFromContainer = await this.itemPickupFromContainer.pickupFromContainer(
      itemPickupData,
      itemToBePicked,
      character
    );

    if (!pickupFromContainer) {
      return false;
    }

    return true;
  }

  @TrackNewRelicTransaction()
  private async updateContainers(
    itemPickupData: IItemPickup,
    character: ICharacter,
    isPickupFromMap: boolean
  ): Promise<boolean> {
    const containerToUpdateId = itemPickupData.fromContainerId;
    const updatedContainer =
      !isPickupFromMap &&
      ((await ItemContainer.findById(containerToUpdateId).lean({
        virtuals: true,
        defaults: true,
      })) as any);

    const inventoryContainerToUpdateId = itemPickupData.toContainerId;
    const updatedInventoryContainer = (await ItemContainer.findById(inventoryContainerToUpdateId).lean({
      virtuals: true,
      defaults: true,
    })) as any;

    if ((!updatedContainer && !isPickupFromMap) || !updatedInventoryContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, error in fetching container information.");
      return false;
    }

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: updatedInventoryContainer,
      openInventoryOnUpdate: isPickupFromMap,
    };

    this.itemPickupUpdater.updateInventoryCharacter(payloadUpdate, character);

    if (!isPickupFromMap) {
      // RPG-1012 - reopen origin container using read to open with correct type
      await this.itemPickupUpdater.sendContainerRead(updatedContainer, character);
    }

    return true;
  }
}
