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
    const lockKey = `item-${item._id}-remove-item-from-container-${fromContainer._id}`;

    const hasLock = await this.locker.lock(lockKey);

    if (!hasLock) {
      return false;
    }

    try {
      const itemToBeRemoved = item;

      if (!itemToBeRemoved) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The item to be removed was not found.");
        return false;
      }

      if (!fromContainer || !fromContainer.slots) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The origin container was not found.");
        return false;
      }

      const clearCache = async (): Promise<void> => {
        await this.inMemoryHashTable.delete("load-craftable-items", character._id);
        await this.inMemoryHashTable.delete("character-max-weights", character._id);
      };

      for (let i = 0; i < fromContainer.slotQty; i++) {
        const slotItem = fromContainer.slots?.[i];

        if (!slotItem) continue;
        if (slotItem._id.toString() === item._id.toString()) {
          fromContainer.slots[i] = null;

          await ItemContainer.updateOne(
            {
              _id: fromContainer._id,
            },
            {
              $set: {
                slots: {
                  ...fromContainer.slots,
                },
              },
            }
          );

          await clearCache();

          await Item.updateOne(
            {
              _id: item._id,
            },
            {
              $set: {
                isInContainer: false,
              },
            }
          );

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(error);
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
      return false;
    }

    const hasLock = await this.locker.lock(`item-${item._id}-add-item-to-container`);

    if (!hasLock) {
      return false;
    }

    try {
      item = (await this.ensureItemHasContainer(item)) as IItem;

      if (!item) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The item to be added was not found.");
        return false;
      }

      const targetContainer = await ItemContainer.findOne({ _id: toContainerId }).lean<IItemContainer>({
        virtuals: true,
        defaults: true,
      });

      if (!targetContainer) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The target container was not found.");
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

      if (!result) {
        return false;
      }

      await Item.updateOne(
        {
          _id: item._id,
          scene: item.scene,
        },
        {
          $set: {
            isInContainer: true,
          },
        }
      );

      if (shouldAddOwnership) {
        await this.itemOwnership.addItemOwnership(item, character);
      }

      return result;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      await this.clearCache(toContainerId, character._id, item.type as ItemType);

      await this.locker.unlock(`item-${item._id}-add-item-to-container`);
    }
  }

  private async ensureItemHasContainer(item: IItem): Promise<IItem | null> {
    if (item.isItemContainer && !item.itemContainer) {
      const newContainer = await this.itemContainerHelper.generateItemContainerIfNotPresentOnItem(item);

      if (!newContainer) {
        throw new Error("Failed to generate item container.");
      }

      item.itemContainer = newContainer?._id;
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
    if (isInventoryItem) {
      return await this.equipmentEquipInventory.equipInventory(character, item);
    }

    if (!this.isItemTypeValid(targetContainer, item)) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Oops! The item type is not valid for this container."
      );
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
  }

  private isItemTypeValid(targetContainer: IItemContainer, item: IItem): boolean {
    const isItemTypeValid = targetContainer.allowedItemTypes?.filter((entry) => {
      return entry === item?.type;
    });

    return !!isItemTypeValid;
  }

  private async clearCache(toContainerId: string, characterId: string, itemType: ItemType): Promise<void> {
    await this.inMemoryHashTable.delete("container-all-items", toContainerId);
    await this.inMemoryHashTable.delete("character-max-weights", characterId);

    if (itemType === ItemType.CraftingResource) {
      await this.inMemoryHashTable.delete("load-craftable-items", characterId);
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

    // Create an array of null values with the length of slotQty
    const updatedSlots = new Array(container.slotQty).fill(null);

    // Use updateOne to set all slots to null
    await ItemContainer.updateOne({ _id: container._id }, { $set: { slots: updatedSlots } });
  }
}
