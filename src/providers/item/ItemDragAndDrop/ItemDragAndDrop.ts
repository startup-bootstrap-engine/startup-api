import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem as IModelItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { blueprintManager } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IEquipmentAndInventoryUpdatePayload, IItem, IItemMove, ItemSocketEvents, ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { AvailableBlueprints } from "../data/types/itemsBlueprintTypes";

@provide(ItemDragAndDrop)
export class ItemDragAndDrop {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private characterItemSlots: CharacterItemSlots,
    private characterInventory: CharacterInventory,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  //! For now, only a move on inventory is allowed.
  @TrackNewRelicTransaction()
  public async performItemMove(itemMoveData: IItemMove, character: ICharacter): Promise<boolean> {
    const isMoveValid = await this.isItemMoveValid(itemMoveData, character);
    if (!isMoveValid) {
      return false;
    }

    await this.clearCharacterCache(
      character,
      itemMoveData.from.containerId,
      itemMoveData.to.containerId,
      itemMoveData.from.item
    );

    const itemToBeMoved = await Item.findById(itemMoveData.from.item._id);
    if (!itemToBeMoved) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, item to be moved wasn't found.");
      return false;
    }

    //! item can be null if it's a move to an empty slot
    const itemToBeMovedTo = await Item.findById(itemMoveData.to.item?._id);
    if (!itemToBeMovedTo && itemMoveData.to.item !== null) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, item to be moved to wasn't found.");
      return false;
    }

    if (itemMoveData.to.source !== itemMoveData.from.source) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you can't move items between different sources."
      );
      return false;
    }

    const source = itemMoveData.from.source;

    try {
      switch (source) {
        case "Inventory":
          await this.moveItemInInventory(
            Object.assign({}, itemMoveData.from, { item: itemToBeMoved }),
            itemMoveData.to,
            character,
            itemMoveData.from.containerId,
            itemMoveData.quantity
          );

          const inventoryContainer = (await ItemContainer.findById(
            itemMoveData.from.containerId
          )) as unknown as IItemContainer;

          const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
            inventory: inventoryContainer as any,
            openEquipmentSetOnUpdate: false,
            openInventoryOnUpdate: false,
          };

          if (itemToBeMoved.maxStackSize > 1) {
            await this.verifyAndRollbackStackQty(
              itemToBeMoved as unknown as IItem,
              itemToBeMovedTo as unknown as IItem,
              itemMoveData,
              character,
              inventoryContainer
            );
          }

          this.sendRefreshItemsEvent(payloadUpdate, character);

          break;
      }

      return true;
    } catch (err) {
      this.socketMessaging.sendErrorMessageToCharacter(character);

      console.log(err);
      return false;
    }
  }

  private async verifyAndRollbackStackQty(
    itemToBeMoved: IItem,
    itemToBeMovedTo: IItem,
    itemMoveData: IItemMove,
    character: ICharacter,
    updatedInventoryContainer: IItemContainer
  ): Promise<void> {
    const initialFromSlotCount = itemToBeMoved.stackQty || 0;
    const initialToSlotCount = itemToBeMovedTo?.stackQty || 0;
    const totalInitialItemCount = initialFromSlotCount + initialToSlotCount;

    // Retrieve updated stack quantities
    const updatedFromSlotCount = updatedInventoryContainer.slots[itemMoveData.from.slotIndex]?.stackQty || 0;
    const updatedToSlotCount = updatedInventoryContainer.slots[itemMoveData.to.slotIndex]?.stackQty || 0;
    const totalUpdatedItemCount = updatedFromSlotCount + updatedToSlotCount;

    // When splitting items or combining items total count of the slots should be equal
    if (totalInitialItemCount !== totalUpdatedItemCount) {
      try {
        await this.characterItemSlots.updateItemOnSlot(itemMoveData.from.slotIndex, updatedInventoryContainer, {
          stackQty: initialFromSlotCount,
        });
        await this.characterItemSlots.updateItemOnSlot(itemMoveData.to.slotIndex, updatedInventoryContainer, {
          stackQty: initialToSlotCount,
        });
      } catch (error) {
        console.error("Item rollback failed:", error);
      }

      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, item move not successful. rollback to original state."
      );
    }
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

  private async moveItemInInventory(
    from: {
      item: IItem;
      slotIndex: number;
    },
    to: {
      item: IItem | null;
      slotIndex: number;
    },
    character: ICharacter,
    containerId: string,
    quantity?: number
  ): Promise<boolean> {
    const targetContainer = await ItemContainer.findById(containerId);

    if (from.item?.rarity !== to.item?.rarity && to.item !== null) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Unable to move items with different rarities.");
      return false;
    }

    if (!from.item) {
      this.socketMessaging.sendErrorMessageToCharacter(character);
      return false;
    }

    if (!targetContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character);
      return false;
    }

    let totalMove = false;

    const moveItem = async (): Promise<void> => {
      await this.characterItemSlots.deleteItemOnSlot(targetContainer, from.item._id);
      await this.characterItemSlots.addItemOnSlot(targetContainer, from.item as unknown as IModelItem, to.slotIndex);
      totalMove = true;
    };

    if (!quantity && !to.item) {
      // Move non stackable items to new slot
      await moveItem();
    } else if (quantity && from.item.stackQty) {
      if (to.item && to.item.stackQty) {
        // Merge stackable items
        await this.handleStackableItemMove(targetContainer, from, to, quantity);
      } else if (quantity >= from.item.stackQty) {
        // Move all stackable items to new slot
        await moveItem();
      } else {
        // Split stackable items
        await this.updateStackQty(targetContainer, from.slotIndex, from.item.stackQty - quantity);
      }
    }

    const hasAddedNewItem = await this.createAndAddNewItem(from, to, character, targetContainer, totalMove, quantity);

    if (!hasAddedNewItem) {
      return false;
    }

    return true;
  }

  private async handleStackableItemMove(
    targetContainer: IItemContainer,
    from: {
      item: IItem;
      slotIndex: number;
    },
    to: {
      item: IItem | null;
      slotIndex: number;
    },
    quantity: number
  ): Promise<void> {
    const toStackQty = to.item?.stackQty;
    const futureQuantity = Math.min(toStackQty! + quantity, to.item?.maxStackSize!);

    await this.updateStackQty(targetContainer, to.slotIndex, futureQuantity);

    const remainingQty = from.item.stackQty! - (futureQuantity - toStackQty!);
    if (remainingQty <= 0) {
      await this.deleteItemFromSlot(targetContainer, from.item._id);
    } else {
      await this.updateStackQty(targetContainer, from.slotIndex, remainingQty);
    }
  }

  private async updateStackQty(targetContainer: IItemContainer, slotIndex: number, newStackQty: number): Promise<void> {
    await this.characterItemSlots.updateItemOnSlot(slotIndex, targetContainer, {
      stackQty: newStackQty,
      owner: targetContainer.owner,
    } as IItem);
  }

  private async deleteItemFromSlot(targetContainer: IItemContainer, itemId: string): Promise<void> {
    await this.characterItemSlots.deleteItemOnSlot(targetContainer, itemId);
    await Item.findByIdAndDelete(itemId);
  }

  private async createAndAddNewItem(
    from: {
      item: IItem;
      slotIndex: number;
    },
    to: {
      item: IItem | null;
      slotIndex: number;
    },
    character: ICharacter,
    targetContainer: IItemContainer,
    totalMove: boolean,
    quantity?: number
  ): Promise<boolean> {
    if (!to.item && !totalMove) {
      const blueprint = await blueprintManager.getBlueprint<IItem>("items", from.item.key as AvailableBlueprints);
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

      await item.save();

      return await this.characterItemSlots.addItemOnSlot(targetContainer, item, to.slotIndex);
    }

    return true;
  }

  private async isItemMoveValid(itemMove: IItemMove, character: ICharacter): Promise<Boolean> {
    const itemFrom = await Item.findById(itemMove.from.item._id);
    const itemTo = await Item.findById(itemMove.to.item?._id);

    if (itemFrom?.rarity !== itemTo?.rarity && itemTo !== null) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Unable to move items with different rarities.");
      return false;
    }

    if (!itemFrom) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, item to be moved wasn't found.");
      return false;
    }

    // should return false if the quantity to be moved is more than the available quantity

    if (itemMove.quantity && itemFrom.stackQty && itemMove.quantity > itemFrom.stackQty) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you can't move more than the available quantity."
      );
      return false;
    }

    // should return false if the source and target slots are the same
    if (itemMove.from.slotIndex === itemMove?.to?.slotIndex) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can't move an item to the same slot.");
      return false;
    }

    // check if itemTo is a container. if so, check if there's enough space before proceeding

    if (itemTo?.isItemContainer) {
      const hasAvailableSlots = await this.characterItemSlots.hasAvailableSlot(
        itemTo.itemContainer as string,
        itemFrom
      );

      if (!hasAvailableSlots) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, there's no space in this container.");
        return false;
      }
    }

    // TODO: Add other sources to move from or to in future
    const isInventory = itemMove.from.source === "Inventory" && itemMove.to.source === "Inventory";
    if (!itemFrom || (!itemTo && itemMove.to.item !== null) || !isInventory) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, this item is not accessible.");
      return false;
    }

    const inventory = await this.characterInventory.getInventory(character);
    if (!inventory) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must have a bag or backpack to move this item."
      );
      return false;
    }

    const inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as IItemContainer;
    if (!inventoryContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, inventory container not found.");
      return false;
    }

    const hasItemToMoveInInventory = inventoryContainer?.itemIds?.find(
      (itemId) => String(itemId) === String(itemFrom._id)
    );
    const hasItemToMoveToInInventory =
      itemTo === null || inventoryContainer?.itemIds?.find((itemId) => String(itemId) === String(itemTo._id));

    if (!hasItemToMoveInInventory || !hasItemToMoveToInInventory) {
      // this.socketMessaging.sendErrorMessageToCharacter(
      //   character,
      //   "Sorry, you do not have this item in your inventory."
      // );
      return false;
    }

    if (
      itemMove.from.containerId.toString() !== inventoryContainer?._id.toString() ||
      itemMove.to.containerId.toString() !== inventoryContainer?._id.toString()
    ) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, this item does not belong to your inventory."
      );
      return false;
    }

    const toSlotItem = inventoryContainer.slots[itemMove.to.slotIndex];

    if (toSlotItem && toSlotItem.key !== itemMove.from.item.key) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you cannot move items of different types.");
      return false;
    }

    if (!inventoryContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must have a bag or backpack to move this item."
      );
      return false;
    }

    return this.characterValidation.hasBasicValidation(character);
  }

  private sendRefreshItemsEvent(payloadUpdate: IEquipmentAndInventoryUpdatePayload, character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }
}
