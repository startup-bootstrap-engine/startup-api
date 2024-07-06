import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { EquipmentEquipInventory } from "@providers/equipment/EquipmentEquipInventory";
import { ItemMap } from "@providers/item/ItemMap";
import { ItemOwnership } from "@providers/item/ItemOwnership";
import { ItemContainerHelper } from "@providers/itemContainer/ItemContainerHelper";
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
    private inMemoryHashTable: InMemoryHashTable,
    private itemContainerHelper: ItemContainerHelper
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

    for (let i = 0; i < fromContainer.slotQty; i++) {
      const slotItem = fromContainer.slots?.[i];
      if (slotItem && slotItem._id.toString() === item._id.toString()) {
        fromContainer.slots[i] = null;
        await this.updateContainerSlots(fromContainer);
        await this.clearCacheForCharacter(character._id);
        return true;
      }
    }

    return false;
  }

  @TrackNewRelicTransaction()
  public async addItemToContainer(
    item: IItem,
    character: ICharacter,
    toContainerId: string,
    options: IAddItemToContainerOptions = {
      shouldAddOwnership: true,
      isInventoryItem: false,
      dropOnMapIfFull: false,
    }
  ): Promise<boolean> {
    const lockKey = `item-${item._id}-add-item-to-container`;
    const hasLock = await this.locker.lock(lockKey);

    if (!hasLock) {
      return false;
    }

    try {
      item = await this.ensureItemHasContainer(item);
      const targetContainer = await this.getTargetContainer(toContainerId);

      if (!targetContainer) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Target container not found.");
        return false;
      }

      await this.clearCacheForItemAddition(targetContainer._id, character._id, item.type as ItemType);

      const result = await this.processItemAddition(character, item, targetContainer, options);

      if (result) {
        await this.updateItemContainerStatus(item);
      }

      return result;
    } catch (error) {
      console.error(error);
      this.socketMessaging.sendErrorMessageToCharacter(character, "An error occurred while adding the item.");
      return false;
    } finally {
      if (options.shouldAddOwnership) {
        await this.itemOwnership.addItemOwnership(item, character);
      }
      await this.clearCacheForItemAddition(toContainerId, character._id, item.type as ItemType);
      await this.locker.unlock(lockKey);
    }
  }

  @TrackNewRelicTransaction()
  public async getInventoryItemContainer(character: ICharacter): Promise<IItemContainer | null> {
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainer = await ItemContainer.findById(inventory?.itemContainer).lean<IItemContainer>({
      virtuals: true,
      defaults: true,
    });

    if (!inventoryContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Character does not have an inventory.");
      return null;
    }

    return inventoryContainer;
  }

  @TrackNewRelicTransaction()
  public async clearAllSlots(container: IItemContainer): Promise<void> {
    if (!container.slots) {
      return;
    }

    for (let i = 0; i < container.slotQty; i++) {
      container.slots[i] = null;
    }

    await container.save();
  }

  private async ensureItemHasContainer(item: IItem): Promise<IItem> {
    if (item.isItemContainer && !item.itemContainer) {
      const newContainer = await this.itemContainerHelper.generateItemContainerIfNotPresentOnItem(item);
      if (!newContainer) {
        throw new Error("Failed to generate item container.");
      }
      item.itemContainer = newContainer._id;
    }
    return item;
  }

  private async getTargetContainer(containerId: string): Promise<IItemContainer | null> {
    return await ItemContainer.findOne({ _id: containerId }).lean<IItemContainer>({
      virtuals: true,
      defaults: true,
    });
  }

  private async processItemAddition(
    character: ICharacter,
    item: IItem,
    targetContainer: IItemContainer,
    options: IAddItemToContainerOptions
  ): Promise<boolean> {
    if (options.isInventoryItem) {
      return this.equipmentEquipInventory.equipInventory(character, item);
    }

    if (!this.isItemTypeValid(targetContainer, item)) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Item type is not valid for this container.");
      return false;
    }

    await this.itemMap.clearItemCoordinates(item, targetContainer);

    if (item.maxStackSize > 1) {
      const wasStacked = await this.characterItemStack.tryAddingItemToStack(character, targetContainer, item);
      if (wasStacked || wasStacked === undefined) {
        return true;
      }
    }

    return this.characterItemSlots.tryAddingItemOnFirstSlot(character, item, targetContainer, options.dropOnMapIfFull);
  }

  private isItemTypeValid(targetContainer: IItemContainer, item: IItem): boolean {
    const isItemTypeValid = targetContainer.allowedItemTypes?.filter((entry) => {
      return entry === item?.type;
    });

    return !!isItemTypeValid;
  }

  private async updateItemContainerStatus(item: IItem): Promise<void> {
    await Item.updateOne({ _id: item._id, scene: item.scene }, { $set: { isInContainer: true } });
  }

  private async updateContainerSlots(container: IItemContainer): Promise<void> {
    await ItemContainer.updateOne({ _id: container._id }, { $set: { slots: { ...container.slots } } });
  }

  private async clearCacheForCharacter(characterId: string): Promise<void> {
    await this.inMemoryHashTable.delete("load-craftable-items", characterId);
    await this.inMemoryHashTable.delete("character-max-weights", characterId);
  }

  private async clearCacheForItemAddition(containerId: string, characterId: string, itemType: ItemType): Promise<void> {
    await this.inMemoryHashTable.delete("container-all-items", containerId);
    await this.inMemoryHashTable.delete("character-max-weights", characterId);

    if (itemType === ItemType.CraftingResource) {
      await this.inMemoryHashTable.delete("load-craftable-items", characterId);
    }
  }
}
