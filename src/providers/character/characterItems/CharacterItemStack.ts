import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { ItemContainerHelper } from "@providers/itemContainer/ItemContainerHelper";
import { provide } from "inversify-binding-decorators";
import { CharacterItemSlots } from "./CharacterItemSlots";

// cases to cover:
// 1: User already has stackable item on its container, and we didn't reach the max stack size. Add to stack.
// 2: User already has stackable item on its container, and we reached the max stack size. Increase stack size to max, and create a new item with the difference.
// 3: User doesn't have stackable item on its container. Create a new item.

@provide(CharacterItemStack)
export class CharacterItemStack {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemSlots: CharacterItemSlots,
    private itemContainerHelper: ItemContainerHelper
  ) {}

  @TrackNewRelicTransaction()
  public async tryAddingItemToStack(
    character: ICharacter,
    targetContainer: IItemContainer,
    itemToBeAdded: IItem
  ): Promise<boolean | undefined> {
    try {
      if (!targetContainer.slots) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, there are no slots in your container.");
        return false;
      }

      const hasAvailableSlots = await this.characterItemSlots.hasAvailableSlot(targetContainer._id, itemToBeAdded);

      if (!hasAvailableSlots) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, there are no available slots in your container."
        );
        return false;
      }

      const allItemsSameKey = await this.characterItemSlots.getAllItemsFromKey(targetContainer, itemToBeAdded);

      if (!allItemsSameKey?.length) {
        return false; // create new item, if there are no items with the same key
      }

      const areAllItemsSameKeyStackFull = allItemsSameKey.every((item) => item.stackQty === itemToBeAdded.maxStackSize);

      if (areAllItemsSameKeyStackFull) {
        return false; // create new item, because there's nothing to stack!
      }

      for (let i = 0; i < targetContainer.slotQty; i++) {
        const slotItem = targetContainer.slots?.[i];

        if (!slotItem || slotItem.maxStackSize <= 1) continue; // if we don't have an item or it's not stackable

        const isSameItem = slotItem.key.replace(/-\d+$/, "") === itemToBeAdded.key.replace(/-\d+$/, "");

        if (!isSameItem || slotItem.rarity !== itemToBeAdded.rarity || slotItem.stackQty === slotItem.maxStackSize) {
          continue;
        }

        const futureStackQty = slotItem.stackQty + itemToBeAdded.stackQty;

        if (futureStackQty > itemToBeAdded.maxStackSize) {
          await this.addToStackAndCreateDifference(i, targetContainer, itemToBeAdded, futureStackQty);
          return false; // new item should be created on itemContainer, with the difference quantity
        }

        await this.addToExistingStack(i, targetContainer, futureStackQty);
        await Item.deleteOne({ _id: itemToBeAdded._id });
        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  @TrackNewRelicTransaction()
  private async addToExistingStack(
    slotIndex: number,
    targetContainer: IItemContainer,
    futureStackQty: number
  ): Promise<void> {
    await this.characterItemSlots.updateItemOnSlot(slotIndex, targetContainer, {
      stackQty: futureStackQty,
    });
  }

  @TrackNewRelicTransaction()
  private async addToStackAndCreateDifference(
    slotIndex: number,
    targetContainer: IItemContainer,
    itemToBeAdded: IItem,
    futureStackQty: number
  ): Promise<void> {
    try {
      const hasDuplicateItem = await this.characterItemSlots.findItemOnSlots(targetContainer, itemToBeAdded._id);

      if (hasDuplicateItem) {
        throw new Error("Item to be added is a duplicate of an existing item.");
      }

      await this.characterItemSlots.updateItemOnSlot(slotIndex, targetContainer, {
        stackQty: itemToBeAdded.maxStackSize,
      });

      const difference = futureStackQty - itemToBeAdded.maxStackSize;

      itemToBeAdded.stackQty = difference;

      if (itemToBeAdded.isItemContainer && !itemToBeAdded.itemContainer) {
        await this.itemContainerHelper.generateItemContainerIfNotPresentOnItem(itemToBeAdded);
      }

      await Item.updateOne({ _id: itemToBeAdded._id }, { $set: { stackQty: difference } });
    } catch (error) {
      console.error(error);
    }
  }
}
