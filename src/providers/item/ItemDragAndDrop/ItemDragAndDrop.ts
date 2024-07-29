import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem as IModelItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { blueprintManager } from "@providers/inversify/container";
import { Locker } from "@providers/locks/Locker";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IEquipmentAndInventoryUpdatePayload, IItem, IItemMove, ItemSocketEvents, ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { ItemBaseKey } from "../ItemBaseKey";
import { AvailableBlueprints } from "../data/types/itemsBlueprintTypes";
import { ItemDragAndDropValidator } from "./ItemDragAndDropValidator";

@provide(ItemDragAndDrop)
export class ItemDragAndDrop {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemSlots: CharacterItemSlots,
    private inMemoryHashTable: InMemoryHashTable,
    private dynamicQueue: DynamicQueue,
    private itemDragAndDropValidator: ItemDragAndDropValidator,
    private itemBaseKey: ItemBaseKey,
    private locker: Locker
  ) {}

  @TrackNewRelicTransaction()
  public async performItemMove(itemMoveData: IItemMove, character: ICharacter): Promise<boolean> {
    try {
      if (!(await this.itemDragAndDropValidator.isItemMoveValid(itemMoveData, character, itemMoveData))) {
        return false;
      }

      const lockKey = `item-move-${character._id}`;

      const canProceed = await this.locker.lock(lockKey);

      if (!canProceed) {
        return false;
      }

      const rollbackActions: (() => Promise<void>)[] = [];
      let success = false;

      try {
        await this.clearCharacterCache(
          character,
          itemMoveData.from.containerId,
          itemMoveData.to.containerId,
          itemMoveData.from.item
        );

        const itemToBeMoved = await this.retrieveItem(itemMoveData.from.item._id);
        if (!itemToBeMoved) {
          throw new Error("Item to be moved wasn't found.");
        }

        const itemToBeMovedTo = itemMoveData.to.item ? await this.retrieveItem(itemMoveData.to.item._id!) : null;
        if (!itemToBeMovedTo && itemMoveData.to.item !== null) {
          throw new Error("Item to be moved to wasn't found.");
        }

        if (itemMoveData.to.source !== itemMoveData.from.source) {
          throw new Error("You can't move items between different sources.");
        }

        await this.executeItemMoveLogic(itemMoveData, character, itemToBeMoved, itemToBeMovedTo, rollbackActions);

        await this.updateInventory(itemMoveData, character);

        success = true;
        return true;
      } catch (error) {
        console.error(error);
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, an error occurred while moving the item: ${(error as Error).message}`
        );
        return false;
      } finally {
        if (!success) {
          await this.performRollback(rollbackActions);
        }

        await this.locker.unlock(lockKey);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private async performRollback(rollbackActions: (() => Promise<void>)[]): Promise<void> {
    for (const action of rollbackActions.reverse()) {
      try {
        await action();
      } catch (error) {
        console.error("Error during rollback:", error);
      }
    }
  }

  private async retrieveItem(itemId: string): Promise<IItem | null> {
    return await Item.findById(itemId).lean<IItem>();
  }

  private async executeItemMoveLogic(
    itemMoveData: IItemMove,
    character: ICharacter,
    itemToBeMoved: IItem,
    itemToBeMovedTo: IItem | null,
    rollbackActions: (() => Promise<void>)[]
  ): Promise<void> {
    await this.moveItemInInventory(
      Object.assign({}, itemMoveData.from, { item: itemToBeMoved }),
      Object.assign({}, itemMoveData.to, { item: itemToBeMovedTo }),
      character,
      itemMoveData.from.containerId,
      itemMoveData.quantity ?? 0,
      rollbackActions
    );
  }

  private async moveItemInInventory(
    from: { item: IItem; slotIndex: number },
    to: { item: IItem | null; slotIndex: number },
    character: ICharacter,
    containerId: string,
    quantity: number,
    rollbackActions: (() => Promise<void>)[]
  ): Promise<boolean> {
    const targetContainer = await ItemContainer.findById(containerId).lean<IItemContainer>();

    if (!targetContainer) {
      throw new Error("Invalid container.");
    }

    if (from.item?.rarity !== to.item?.rarity && to.item !== null) {
      throw new Error("Unable to move items with different rarities.");
    }

    if (!from.item || !targetContainer) {
      throw new Error("Invalid item or container.");
    }

    let totalMove = false;

    if (!(from.item as unknown as IModelItem).isInContainer) {
      // if we dont have this property, add to avoid deletion by cleaners
      await Item.updateOne({ _id: from.item._id }, { isInContainer: true });
    }

    const moveItem = async (): Promise<boolean> => {
      const originalFromItem = { ...from.item };
      const originalToItem = to.item ? { ...to.item } : null;

      const result = await this.characterItemSlots.deleteItemOnSlot(targetContainer, from.item._id);
      if (!result) {
        throw new Error("Failed to delete item from slot.");
      }

      rollbackActions.push(async () => {
        await this.characterItemSlots.addItemOnSlot(
          targetContainer,
          originalFromItem as unknown as IModelItem,
          from.slotIndex
        );
      });

      const hasAddedItemOnSlot = await this.characterItemSlots.addItemOnSlot(
        targetContainer,
        from.item as unknown as IModelItem,
        to.slotIndex
      );

      if (!hasAddedItemOnSlot) {
        throw new Error("Failed to add item on slot.");
      }

      rollbackActions.push(async () => {
        await this.characterItemSlots.deleteItemOnSlot(targetContainer, from.item._id);
        if (originalToItem) {
          await this.characterItemSlots.addItemOnSlot(
            targetContainer,
            originalToItem as unknown as IModelItem,
            to.slotIndex
          );
        }
      });

      totalMove = true;
      return true;
    };

    if (!quantity && !to.item) {
      await moveItem();
    } else if (quantity && from.item.stackQty) {
      if (to.item && to.item.stackQty) {
        await this.handleStackableItemMove(targetContainer, from, to, quantity, rollbackActions);
      } else if (quantity >= from.item.stackQty) {
        await moveItem();
      } else {
        const originalStackQty = from.item.stackQty;
        await this.updateStackQty(targetContainer, from.slotIndex, from.item.stackQty - quantity);
        rollbackActions.push(async () => {
          await this.updateStackQty(targetContainer, from.slotIndex, originalStackQty);
        });
      }
    }

    const hasAddedNewItem = await this.createAndAddNewItem(
      from,
      to,
      character,
      targetContainer,
      totalMove,
      quantity,
      rollbackActions
    );

    if (!hasAddedNewItem) {
      throw new Error("Failed to add new item.");
    }

    return true;
  }

  private async handleStackableItemMove(
    targetContainer: IItemContainer,
    from: { item: IItem; slotIndex: number },
    to: { item: IItem | null; slotIndex: number },
    quantity: number,
    rollbackActions: (() => Promise<void>)[]
  ): Promise<void> {
    const toStackQty = to.item?.stackQty ?? 0;
    const futureQuantity = Math.min(toStackQty + quantity, to.item?.maxStackSize ?? Infinity);

    const originalToStackQty = toStackQty;
    await this.updateStackQty(targetContainer, to.slotIndex, futureQuantity);
    rollbackActions.push(async () => {
      await this.updateStackQty(targetContainer, to.slotIndex, originalToStackQty);
    });

    const remainingQty = from.item.stackQty! - (futureQuantity - toStackQty);
    if (remainingQty <= 0) {
      const deletedItem = await this.deleteItemFromSlot(targetContainer, from.item._id);
      rollbackActions.push(async () => {
        if (deletedItem) {
          await Item.create(deletedItem);
          await this.characterItemSlots.addItemOnSlot(targetContainer, deletedItem as any, from.slotIndex);
        }
      });
    } else {
      const originalFromStackQty = from.item.stackQty!;
      await this.updateStackQty(targetContainer, from.slotIndex, remainingQty);
      rollbackActions.push(async () => {
        await this.updateStackQty(targetContainer, from.slotIndex, originalFromStackQty);
      });
    }
  }

  private async updateStackQty(targetContainer: IItemContainer, slotIndex: number, newStackQty: number): Promise<void> {
    await this.characterItemSlots.updateItemOnSlot(slotIndex, targetContainer, {
      stackQty: newStackQty,
      owner: targetContainer.owner,
    });
  }

  private async deleteItemFromSlot(targetContainer: IItemContainer, itemId: string): Promise<IItem | null> {
    await this.characterItemSlots.deleteItemOnSlot(targetContainer, itemId);
    return await Item.findByIdAndDelete(itemId).lean();
  }

  private async createAndAddNewItem(
    from: { item: IItem; slotIndex: number },
    to: { item: IItem | null; slotIndex: number },
    character: ICharacter,
    targetContainer: IItemContainer,
    totalMove: boolean,
    quantity: number,
    rollbackActions: (() => Promise<void>)[]
  ): Promise<boolean> {
    if (!to.item && !totalMove) {
      const itemBaseKey = this.itemBaseKey.getBaseKey(from.item.key);
      const blueprint = await blueprintManager.getBlueprint<IItem>("items", itemBaseKey as AvailableBlueprints);
      if (!blueprint) {
        return false;
      }

      const item = new Item({
        ...blueprint,
        attack: from.item.attack ?? blueprint.attack,
        defense: from.item.defense ?? blueprint.defense,
        rarity: from.item.rarity ?? blueprint.rarity,
        stackQty: quantity ?? from.item.stackQty,
        owner: character._id,
      });

      // eslint-disable-next-line mongoose-lean/require-lean
      await item.save();
      rollbackActions.push(async () => {
        await Item.findByIdAndDelete(item._id).lean();
      });

      const success = await this.characterItemSlots.addItemOnSlot(targetContainer, item, to.slotIndex);
      if (success) {
        rollbackActions.push(async () => {
          await this.characterItemSlots.deleteItemOnSlot(targetContainer, item._id);
        });
      }
      return success;
    }

    return true;
  }

  private async clearCharacterCache(
    character: ICharacter,
    fromContainerId: string,
    toContainerId: string,
    itemToBeDropped: IItem
  ): Promise<void> {
    const promises = [
      this.inMemoryHashTable.delete("container-all-items", fromContainerId),
      this.inMemoryHashTable.delete("container-all-items", toContainerId),
      clearCacheForKey(`${character._id}-inventory`),
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
  }

  private sendRefreshItemsEvent(payloadUpdate: IEquipmentAndInventoryUpdatePayload, character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }

  private async updateInventory(itemMoveData: IItemMove, character: ICharacter): Promise<void> {
    const inventoryContainer = (await ItemContainer.findById(itemMoveData.from.containerId).lean()) as IItemContainer;
    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer as any,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: false,
    };
    this.sendRefreshItemsEvent(payloadUpdate, character);
  }
}
