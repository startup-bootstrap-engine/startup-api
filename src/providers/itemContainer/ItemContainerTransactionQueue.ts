/* eslint-disable no-async-promise-executor */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemContainerRead, ItemContainerType, ItemSocketEvents } from "@rpg-engine/shared";
import { clearCacheForKey } from "speedgoose";

interface IItemContainerTransactionRead {
  itemContainerId: string;
  type: ItemContainerType;
}

interface IItemContainerTransactionOption {
  readContainersAfterTransaction?: IItemContainerTransactionRead[];
  shouldAddOwnership?: boolean;
  updateCharacterWeightAfterTransaction?: boolean;
}

interface IContainerSnapshot {
  containerId: string;
  slots: Record<string, IItem | null>;
}

@provideSingleton(ItemContainerTransactionQueue)
export class ItemContainerTransactionQueue {
  constructor(
    private characterItemContainer: CharacterItemContainer,
    private characterItemSlots: CharacterItemSlots,
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private locker: Locker,
    private inMemoryHashTable: InMemoryHashTable,
    private characterWeightQueue: CharacterWeightQueue,
    private dynamicQueue: DynamicQueue,
    private resultsPoller: ResultsPoller
  ) {}

  @TrackNewRelicTransaction()
  public async transferToContainer(
    item: IItem,
    character: ICharacter,
    originContainer: IItemContainer,
    targetContainer: IItemContainer,
    options: IItemContainerTransactionOption = {
      shouldAddOwnership: true,
      updateCharacterWeightAfterTransaction: true,
    }
  ): Promise<boolean> {
    options.shouldAddOwnership = options.shouldAddOwnership ?? true;
    options.updateCharacterWeightAfterTransaction = options.updateCharacterWeightAfterTransaction ?? true;

    const lockKey = `transfer-${originContainer._id}-${targetContainer._id}`;
    const canProceed = await this.locker.lock(lockKey);

    if (!canProceed) {
      return false;
    }

    try {
      if (appEnv.general.IS_UNIT_TEST) {
        return await this.execTransferToContainer(item, character, originContainer, targetContainer, options);
      }

      // Take snapshots before performing the transaction
      const [originSnapshot, targetSnapshot] = await Promise.all([
        this.takeContainerSnapshot(originContainer),
        this.takeContainerSnapshot(targetContainer),
      ]);

      await this.dynamicQueue.addJob(
        "item-container-transaction-queue",
        async (job) => {
          const { item, character, originContainer, targetContainer, options } = job.data;
          const result = await this.execTransferToContainer(item, character, originContainer, targetContainer, options);

          await this.resultsPoller.prepareResultToBePolled(
            "item-container-transfer-results",
            `${originContainer._id}-to-${targetContainer._id}`,
            result
          );

          return result;
        },
        {
          item,
          character,
          originContainer,
          targetContainer,
          options,
        }
      );

      const result = await this.resultsPoller.pollResults(
        "item-container-transfer-results",
        `${originContainer._id}-to-${targetContainer._id}`
      );

      if (!result) {
        await this.rollbackTransfer(character, originSnapshot, targetSnapshot);
      }

      return result;
    } finally {
      await this.locker.unlock(lockKey);
    }
  }

  public shutdown(): Promise<void> {
    return this.dynamicQueue.shutdown();
  }

  @TrackNewRelicTransaction()
  private async execTransferToContainer(
    item: IItem,
    character: ICharacter,
    originContainer: IItemContainer,
    targetContainer: IItemContainer,
    options: IItemContainerTransactionOption
  ): Promise<boolean> {
    const lockKey = `${originContainer?._id}-to-${targetContainer?._id}-item-container-transfer`;

    const { readContainersAfterTransaction, updateCharacterWeightAfterTransaction } = options;

    const [originSnapshot, targetSnapshot] = await Promise.all([
      this.takeContainerSnapshot(originContainer),
      this.takeContainerSnapshot(targetContainer),
    ]);

    try {
      if (!(await this.locker.lock(lockKey))) {
        return false;
      }

      if (!(await this.preValidateTransaction(character, originContainer, targetContainer, item))) {
        return false;
      }

      await this.clearContainersCache(originContainer, targetContainer);

      const result = await this.performTransaction(item, character, originContainer, targetContainer, options);

      const wasTransactionConsistent = await this.wasTransactionConsistent(
        item,
        originSnapshot,
        targetSnapshot,
        originContainer,
        targetContainer
      );
      if (!result || !wasTransactionConsistent) {
        await this.rollbackTransfer(character, originSnapshot, targetSnapshot);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Execution of transfer failed:", error);
      await this.rollbackTransfer(character, originSnapshot, targetSnapshot);
      return false;
    } finally {
      await this.clearContainersCache(originContainer, targetContainer);

      if (readContainersAfterTransaction) {
        await this.readAndRefreshContainersAfterTransaction(character, readContainersAfterTransaction);
      }

      if (updateCharacterWeightAfterTransaction) {
        await this.characterWeightQueue.updateCharacterWeight(character);
      }

      await this.locker.unlock(lockKey);
    }
  }

  private takeContainerSnapshot(container: IItemContainer): IContainerSnapshot {
    const snapshot: IContainerSnapshot = {
      containerId: container._id.toString(),
      slots: {},
    };
    for (const [slotId, item] of Object.entries(container.slots)) {
      snapshot.slots[slotId] = item ? ({ ...item } as IItem) : null;
    }
    return snapshot;
  }

  private async applyContainerSnapshot(snapshot: IContainerSnapshot): Promise<void> {
    await ItemContainer.updateOne({ _id: snapshot.containerId }, { $set: { slots: snapshot.slots } });
  }

  private async wasTransactionConsistent(
    item: IItem,
    originSnapshot: IContainerSnapshot,
    targetSnapshot: IContainerSnapshot,
    originContainer: IItemContainer,
    targetContainer: IItemContainer
  ): Promise<boolean> {
    const updatedOriginContainer = await ItemContainer.findById(originContainer._id).lean<IItemContainer>();
    const updatedTargetContainer = await ItemContainer.findById(targetContainer._id).lean<IItemContainer>();

    if (!updatedOriginContainer || !updatedTargetContainer) {
      return false;
    }

    if (item.stackQty && item.stackQty > 0) {
      return await this.isTransactionConsistentForStackableItems(
        item,
        originSnapshot,
        targetSnapshot,
        updatedOriginContainer,
        updatedTargetContainer
      );
    } else {
      return await this.isTransactionConsistentForNonStackableItems(
        item,
        updatedOriginContainer,
        updatedTargetContainer
      );
    }
  }

  private async isTransactionConsistentForStackableItems(
    item: IItem,
    originSnapshot: IContainerSnapshot,
    targetSnapshot: IContainerSnapshot,
    updatedOriginContainer: IItemContainer,
    updatedTargetContainer: IItemContainer
  ): Promise<boolean> {
    const preTransactionOriginQty = this.getTotalQtyFromSnapshot(originSnapshot, item, item.rarity!);
    const preTransactionTargetQty = this.getTotalQtyFromSnapshot(targetSnapshot, item, item.rarity!);

    const postTransactionOriginQty = await this.getTotalQtyFromContainer(updatedOriginContainer, item, item.rarity!);
    const postTransactionTargetQty = await this.getTotalQtyFromContainer(updatedTargetContainer, item, item.rarity!);

    const isOriginConsistent = postTransactionOriginQty === preTransactionOriginQty - item.stackQty!;
    const isTargetConsistent = postTransactionTargetQty === preTransactionTargetQty + item.stackQty!;

    return isOriginConsistent && isTargetConsistent;
  }

  private async isTransactionConsistentForNonStackableItems(
    item: IItem,
    updatedOriginContainer: IItemContainer,
    updatedTargetContainer: IItemContainer
  ): Promise<boolean> {
    const originSlotIndex = await this.characterItemSlots.findItemSlotIndex(updatedOriginContainer, item._id);
    const targetSlotIndex = await this.characterItemSlots.findItemSlotIndex(updatedTargetContainer, item._id);

    const wasItemRemovedFromOrigin = originSlotIndex === undefined;
    const wasItemAddedToTarget = targetSlotIndex !== undefined;

    return wasItemRemovedFromOrigin && wasItemAddedToTarget;
  }

  private getTotalQtyFromSnapshot(snapshot: IContainerSnapshot, item: IItem, itemRarity: string): number {
    let qty = 0;
    for (const slotItem of Object.values(snapshot.slots)) {
      if (slotItem && slotItem.key === item.key && slotItem.rarity === itemRarity) {
        qty += slotItem.stackQty || 1;
      }
    }
    return qty;
  }

  private async getTotalQtyFromContainer(container: IItemContainer, item: IItem, itemRarity: string): Promise<number> {
    return await this.characterItemSlots.getTotalQty(container, item, itemRarity);
  }

  private async performTransaction(
    item: IItem,
    character: ICharacter,
    originContainer: IItemContainer,
    targetContainer: IItemContainer,
    options: IItemContainerTransactionOption
  ): Promise<boolean> {
    item.baseKey = item.key.replace(/-\d+$/, "");

    const addItemSuccessful = await this.characterItemContainer.addItemToContainer(
      item,
      character,
      targetContainer._id,
      {
        shouldAddOwnership: options.shouldAddOwnership,
      }
    );

    if (!addItemSuccessful) {
      console.error("Failed to add item to target container.");
      return false;
    }

    const removeItemSuccessful = await this.characterItemContainer.removeItemFromContainer(
      item,
      character,
      originContainer
    );

    if (!removeItemSuccessful) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Failed to remove original item from origin container."
      );
      return false;
    }

    return true;
  }

  private async rollbackTransfer(
    character: ICharacter,
    originSnapshot: IContainerSnapshot,
    targetSnapshot: IContainerSnapshot
  ): Promise<void> {
    console.error(
      `Rolling back item transfer for character ${character._id} - ${character.name} - originContainer: ${originSnapshot.containerId} - targetContainer: ${targetSnapshot.containerId}`
    );

    try {
      await this.applyContainerSnapshot(originSnapshot);
      await this.applyContainerSnapshot(targetSnapshot);

      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "An error occurred during item transfer. The operation has been rolled back."
      );
    } catch (error) {
      console.error("Rollback failed:", error);
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "An error occurred during item transfer rollback. Please check your inventory and contact support if there are any issues."
      );
    }
  }

  private async clearContainersCache(originContainer: IItemContainer, targetContainer: IItemContainer): Promise<void> {
    await Promise.all([
      clearCacheForKey(`${originContainer.owner!.toString()}-inventory`),
      this.inMemoryHashTable.delete("inventory-weight", originContainer._id.toString()),
      this.inMemoryHashTable.delete("equipment-weight", originContainer._id.toString()),
      this.inMemoryHashTable.delete("container-all-items", originContainer._id.toString()),
      this.inMemoryHashTable.delete("container-all-items", targetContainer._id.toString()),
      this.inMemoryHashTable.delete("inventory-weight", originContainer.owner!.toString()!),
      this.inMemoryHashTable.delete("load-craftable-items", originContainer.owner?.toString()!),
      this.inMemoryHashTable.delete("character-max-weights", originContainer.owner!.toString()!),
      this.inMemoryHashTable.delete("character-weights", originContainer.owner!.toString()!),
    ]);
  }

  private async readAndRefreshContainersAfterTransaction(
    character: ICharacter,
    readContainers: IItemContainerTransactionRead[]
  ): Promise<void> {
    for (const readContainer of readContainers) {
      const itemContainer = (await ItemContainer.findById(readContainer.itemContainerId).lean()) as IItemContainer;

      if (!itemContainer) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Failed to read container after transaction.");
        continue;
      }

      this.socketMessaging.sendEventToUser<IItemContainerRead>(character.channelId!, ItemSocketEvents.ContainerRead, {
        itemContainer: itemContainer as any,
        type: readContainer.type,
      });
    }
  }

  private async preValidateTransaction(
    character: ICharacter,
    originContainer: IItemContainer,
    targetContainer: IItemContainer,
    item: IItem
  ): Promise<boolean> {
    if (!this.characterValidation.hasBasicValidation(character)) {
      return false;
    }

    const [originContainerExists, targetContainerExists, hasSpace] = await Promise.all([
      ItemContainer.exists({ _id: originContainer._id, owner: character._id }),
      ItemContainer.exists({ _id: targetContainer._id, owner: character._id }),
      this.characterItemSlots.hasAvailableSlot(targetContainer._id, item, false),
    ]);

    if (!originContainerExists) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, the origin container wasn't found for this owner."
      );
      return false;
    }

    if (!targetContainerExists) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, the target container wasn't found for this owner."
      );
      return false;
    }

    if (!hasSpace) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, your target container is full.");
      return false;
    }

    const doesOriginContainerHasItem = this.characterItemSlots.findItemWithSameKey(originContainer, item.key);

    if (!doesOriginContainerHasItem) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, the item wasn't found in the origin container."
      );
      return false;
    }

    return true;
  }
}
