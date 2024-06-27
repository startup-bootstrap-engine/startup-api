import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { EquipmentEquipInventory } from "@providers/equipment/EquipmentEquipInventory";
import { ItemMap } from "@providers/item/ItemMap";
import { ItemOwnership } from "@providers/item/ItemOwnership";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterInventory } from "../CharacterInventory";
import { CharacterItemSlots } from "./CharacterItemSlots";
import { CharacterItemStack } from "./CharacterItemStack";

interface IAddItemToContainerOptions {
  shouldAddOwnership?: boolean;
  isInventoryItem?: boolean;
  dropOnMapIfFull?: boolean;
}

@provide(CharacterItemContainer)
export class CharacterItemContainer {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemStack: CharacterItemStack,
    private characterItemSlots: CharacterItemSlots,
    private equipmentEquipInventory: EquipmentEquipInventory,
    private itemMap: ItemMap,
    private characterInventory: CharacterInventory,
    private itemOwnership: ItemOwnership,
    private locker: Locker,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  @TrackNewRelicTransaction()
  public async removeItemFromContainer(
    item: IItem,
    character: ICharacter,
    fromContainer: IItemContainer
  ): Promise<boolean> {
    if (!item || !fromContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Invalid item or container.");
      return false;
    }

    const lockKey = `item-${item._id}-remove-from-container`;
    const hasLock = await this.locker.lock(lockKey);

    if (!hasLock) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "The item is currently being processed.");
      return false;
    }

    try {
      const slotIndex = this.findItemSlotIndex(fromContainer, item);

      if (slotIndex === -1) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Item not found in the container.");
        return false;
      }

      fromContainer.slots[slotIndex] = null;

      await ItemContainer.updateOne(
        { _id: fromContainer._id },
        { $set: { [`slots.${slotIndex}`]: null } },
        { new: true }
      );

      await this.clearCache(fromContainer._id, character._id, item.type as ItemType);
      await Item.updateOne({ _id: item._id }, { $set: { isInContainer: false } });

      return true;
    } catch (error) {
      console.error("Error removing item from container:", error);
      this.socketMessaging.sendErrorMessageToCharacter(character, "An error occurred while removing the item.");
      return false;
    } finally {
      await this.locker.unlock(lockKey);
    }
  }

  @TrackNewRelicTransaction()
  public async addItemToContainer(
    item: IItem,
    character: ICharacter,
    toContainerId: string,
    options?: IAddItemToContainerOptions
  ): Promise<boolean> {
    const { shouldAddOwnership = true, isInventoryItem = false, dropOnMapIfFull = false } = options || {};

    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Invalid item.");
      return false;
    }

    const lockKey = `item-${item._id}-add-item-to-container`;
    const hasLock = await this.locker.lock(lockKey);

    if (!hasLock) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "The item is currently being processed.");
      return false;
    }

    try {
      item = (await this.ensureItemHasContainer(item)) as IItem;

      if (!item) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Failed to process the item.");
        return false;
      }

      const targetContainer = await ItemContainer.findOne({ _id: toContainerId });

      if (!targetContainer) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Target container not found.");
        return false;
      }

      await this.clearCache(targetContainer._id, character._id, item.type as ItemType);

      const result = await this.tryToAddItemToContainer(
        character,
        item,
        targetContainer,
        isInventoryItem,
        dropOnMapIfFull
      );

      if (result) {
        await Item.updateOne({ _id: item._id, scene: item.scene }, { $set: { isInContainer: true } });
      }

      return result;
    } catch (error) {
      console.error("Error adding item to container:", error);
      this.socketMessaging.sendErrorMessageToCharacter(character, "An error occurred while adding the item.");
      return false;
    } finally {
      if (shouldAddOwnership) {
        await this.itemOwnership.addItemOwnership(item, character);
      }

      await this.clearCache(toContainerId, character._id, item.type as ItemType);
      await this.locker.unlock(lockKey);
    }
  }

  private async ensureItemHasContainer(item: IItem): Promise<IItem | null> {
    if (item.isItemContainer && !item.itemContainer) {
      item = (await Item.findById(item._id)) as IItem;
      if (item) {
        await item.save();
      }
    }
    return item;
  }

  private async tryToAddItemToContainer(
    character: ICharacter,
    item: IItem,
    targetContainer: IItemContainer,
    isInventoryItem: boolean,
    dropOnMapIfFull: boolean
  ): Promise<boolean> {
    try {
      if (isInventoryItem) {
        return await this.equipmentEquipInventory.equipInventory(character, item);
      }

      if (!this.isItemTypeValid(targetContainer, item)) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Invalid item type for this container.");
        return false;
      }

      await this.itemMap.clearItemCoordinates(item, targetContainer);

      if (item.maxStackSize > 1) {
        const wasStacked = await this.characterItemStack.tryAddingItemToStack(character, targetContainer, item);
        if (wasStacked || wasStacked === undefined) {
          return true;
        }
      }

      return await this.characterItemSlots.tryAddingItemOnFirstSlot(character, item, targetContainer, dropOnMapIfFull);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private isItemTypeValid(targetContainer: IItemContainer, item: IItem): boolean {
    if (targetContainer.allowedItemTypes?.length === 0) return true;

    const isItemTypeValid = targetContainer.allowedItemTypes?.filter((entry) => {
      return entry === item?.type;
    });

    return !!isItemTypeValid;
  }

  private async clearCache(containerId: string, characterId: string, itemType: ItemType): Promise<void> {
    await Promise.all([
      this.inMemoryHashTable.delete("container-all-items", containerId),
      this.inMemoryHashTable.delete("character-max-weights", characterId),
      itemType === ItemType.CraftingResource
        ? this.inMemoryHashTable.delete("load-craftable-items", characterId)
        : Promise.resolve(),
    ]);
  }

  @TrackNewRelicTransaction()
  public async getInventoryItemContainer(character: ICharacter): Promise<IItemContainer | null> {
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainer = await ItemContainer.findById(inventory?.itemContainer);

    if (!inventoryContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The character does not have an inventory.");
      return null;
    }

    return inventoryContainer;
  }

  @TrackNewRelicTransaction()
  public async clearAllSlots(container: IItemContainer): Promise<void> {
    if (!container.slots) {
      return;
    }

    const updatedSlots = Object.fromEntries(Array.from({ length: container.slotQty }, (_, i) => [i, null]));

    await ItemContainer.updateOne({ _id: container._id }, { $set: { slots: updatedSlots } });
  }

  public findItemSlotIndex(container: IItemContainer, item: IItem): number {
    return Object.entries(container.slots as Record<string, IItem | null>).findIndex(
      ([_, slotItem]) => slotItem && slotItem._id.toString() === item._id.toString()
    );
  }
}
