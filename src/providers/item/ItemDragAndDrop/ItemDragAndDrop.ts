import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem as IModelItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { blueprintManager } from "@providers/inversify/container";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IEquipmentAndInventoryUpdatePayload, IItem, IItemMove, ItemSocketEvents, ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { AvailableBlueprints } from "../data/types/itemsBlueprintTypes";
import { ItemDragAndDropValidator } from "./ItemDragAndDropValidator";

@provide(ItemDragAndDrop)
export class ItemDragAndDrop {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemSlots: CharacterItemSlots,
    private inMemoryHashTable: InMemoryHashTable,
    private dynamicQueue: DynamicQueue,
    private itemDragAndDropValidator: ItemDragAndDropValidator
  ) {}

  //! For now, only a move on inventory is allowed.
  @TrackNewRelicTransaction()
  public async performItemMove(itemMoveData: IItemMove, character: ICharacter): Promise<boolean> {
    try {
      if (!(await this.itemDragAndDropValidator.isItemMoveValid(itemMoveData, character))) {
        return false;
      }

      if (appEnv.general.IS_UNIT_TEST) {
        return await this.processItemMove(itemMoveData, character);
      }

      await this.dynamicQueue.addJob(
        "item-move",
        async (job) => {
          const { itemMoveData, characterId } = job.data;

          const character = (await Character.findById(characterId).lean()) as ICharacter;

          if (!character) {
            throw new Error("Character not found.");
          }

          void this.processItemMove(itemMoveData, character);
        },
        { itemMoveData, characterId: character._id }
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private async processItemMove(itemMoveData: IItemMove, character: ICharacter): Promise<boolean> {
    try {
      await this.clearCharacterCache(
        character,
        itemMoveData.from.containerId,
        itemMoveData.to.containerId,
        itemMoveData.from.item
      );

      const itemToBeMoved = await this.retrieveItem(itemMoveData.from.item._id);
      if (!itemToBeMoved) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, item to be moved wasn't found.");
        return false;
      }

      const itemToBeMovedTo = await this.retrieveItem(itemMoveData.to.item?._id!);
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

      await this.executeItemMoveLogic(itemMoveData, character, itemToBeMoved, itemToBeMovedTo);

      await this.updateInventory(itemMoveData, character);

      return true;
    } catch (error) {
      console.error(error);

      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, an error occurred while moving the item.");

      return false;
    }
  }

  private async retrieveItem(itemId: string): Promise<IItem | null> {
    return await Item.findById(itemId).lean<IItem>();
  }

  private async executeItemMoveLogic(
    itemMoveData: IItemMove,
    character: ICharacter,
    itemToBeMoved: IItem,
    itemToBeMovedTo: IItem | null // Add itemToBeMovedTo to the parameters
  ): Promise<void> {
    // Logic extracted from the switch statement in the original method, pertaining to "Inventory"
    await this.moveItemInInventory(
      Object.assign({}, itemMoveData.from, { item: itemToBeMoved }),
      Object.assign({}, itemMoveData.to, { item: itemToBeMovedTo }), // Pass itemToBeMovedTo
      character,
      itemMoveData.from.containerId,
      itemMoveData.quantity
    );
  }

  private async moveItemInInventory(
    from: { item: IItem; slotIndex: number },
    to: { item: IItem | null; slotIndex: number },
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

    const moveItem = async (): Promise<boolean> => {
      try {
        const result = await this.characterItemSlots.deleteItemOnSlot(targetContainer, from.item._id);

        if (!result) {
          this.socketMessaging.sendErrorMessageToCharacter(character);
          return false;
        }

        await this.characterItemSlots.addItemOnSlot(targetContainer, from.item as unknown as IModelItem, to.slotIndex);
        totalMove = true;

        return true;
      } catch (error) {
        this.socketMessaging.sendErrorMessageToCharacter(character);
        return false;
      }
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
    const inventoryContainer = (await ItemContainer.findById(itemMoveData.from.containerId)) as IItemContainer;
    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer as any,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: false,
    };
    this.sendRefreshItemsEvent(payloadUpdate, character);
  }
}
