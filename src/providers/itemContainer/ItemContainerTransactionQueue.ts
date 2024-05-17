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
import { ITEM_CONTAINER_ROLLBACK_MAX_TRIES } from "@providers/constants/ItemContainerConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
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
    private dynamicQueue: DynamicQueue
  ) {}

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
    if (!options.shouldAddOwnership) {
      options.shouldAddOwnership = true;
    }

    if (!options.updateCharacterWeightAfterTransaction) {
      options.updateCharacterWeightAfterTransaction = true;
    }

    if (appEnv.general.IS_UNIT_TEST) {
      return await this.execTransferToContainer(item, character, originContainer, targetContainer, options!);
    }

    await this.dynamicQueue.addJob(
      "item-container-transaction-queue",

      async (job) => {
        const { item, character, originContainer, targetContainer, options } = job.data;

        const result = await this.execTransferToContainer(item, character, originContainer, targetContainer, options);

        await this.inMemoryHashTable.set(
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

    // we have to do this hack because remember once the job goes to the worker, its processed in a different instance
    const result = await this.pollForItemContainerTransferResults(
      originContainer._id.toString(),
      targetContainer._id.toString()
    );

    return result;
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
    try {
      const canProceed = await this.locker.lock(
        `${originContainer?._id}-to-${targetContainer?._id}-item-container-transfer`
      );

      if (!canProceed) {
        return false;
      }

      const isPreValidationSuccessful = await this.preValidateTransaction(
        character,
        originContainer,
        targetContainer,
        item
      );

      if (!isPreValidationSuccessful) {
        return false;
      }

      await this.clearContainersCache(originContainer, targetContainer);

      const result = await this.performTransaction(item, character, originContainer, targetContainer, options);

      const { readContainersAfterTransaction } = options;

      if (result && readContainersAfterTransaction) {
        await this.readAndRefreshContainersAfterTransaction(character, readContainersAfterTransaction);
      }

      await this.clearContainersCache(originContainer, targetContainer);

      if (options.updateCharacterWeightAfterTransaction) {
        await this.characterWeightQueue.updateCharacterWeight(character);
      }

      return result;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      await this.locker.unlock(`${originContainer?._id}-to-${targetContainer?._id}-item-container-transfer`);
      await this.inMemoryHashTable.delete(
        "item-container-transfer-results",
        `${originContainer?._id}-to-${targetContainer?._id}`
      );
    }
  }

  public pollForItemContainerTransferResults(originContainerId: string, targetContainerId: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      let attempt = 0;
      while (attempt < 10) {
        const result = await this.inMemoryHashTable.get(
          "item-container-transfer-results",
          `${originContainerId}-to-${targetContainerId}`
        );

        if (result) {
          await this.inMemoryHashTable.delete(
            "item-container-transfer-results",
            `${originContainerId}-to-${targetContainerId}`
          );
          resolve(result as unknown as boolean);
        }

        attempt++;
      }

      resolve(false);
    });
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

  private async performTransaction(
    item: IItem,
    character: ICharacter,
    originContainer: IItemContainer,
    targetContainer: IItemContainer,
    options: IItemContainerTransactionOption
  ): Promise<boolean> {
    item.baseKey = item.key.replace(/-\d+$/, ""); // we have to add this because once this comes from the queue worker, the item becomes a JSON and baseKey is a virtual field

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

      // Attempt rollback by removing the item from the target container
      const rollbackSuccessful = await this.retryOperation(async () => {
        return await this.characterItemContainer.removeItemFromContainer(item, character, targetContainer._id);
      });

      if (!rollbackSuccessful) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Failed to rollback item addition to target container. Please check your inventory."
        );
      }

      return false;
    }

    return true;
  }

  private async retryOperation(operation: () => Promise<boolean>): Promise<boolean> {
    let attempt = 0;
    while (attempt < ITEM_CONTAINER_ROLLBACK_MAX_TRIES) {
      const success = await operation();
      if (success) return true;
      attempt++;
    }
    return false;
  }

  private async preValidateTransaction(
    character: ICharacter,
    originContainer: IItemContainer,
    targetContainer: IItemContainer,
    item: IItem
  ): Promise<boolean> {
    const hasBasicCharacterValidation = this.characterValidation.hasBasicValidation(character);

    if (!hasBasicCharacterValidation) {
      return false;
    }

    const doesOriginContainerExists = await ItemContainer.exists({ _id: originContainer._id, owner: character._id });

    if (!doesOriginContainerExists) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, the origin container wasn't found for this owner."
      );
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

    const doesTargetContainerExists = await ItemContainer.exists({ _id: targetContainer._id, owner: character._id });

    if (!doesTargetContainerExists) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, the target container wasn't found for this owner."
      );
      return false;
    }

    const hasSpace = await this.characterItemSlots.hasAvailableSlot(targetContainer._id, item, false);

    if (!hasSpace) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, your target container is full.");
      return false;
    }

    return true;
  }
}
