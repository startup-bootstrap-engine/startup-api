import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item, warnAboutItemChanges } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { isSameKey } from "@providers/dataStructures/KeyHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

import { provide } from "inversify-binding-decorators";

@provide(CharacterItemSlots)
export class CharacterItemSlots {
  constructor(private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public async getTotalQty(targetContainer: IItemContainer, item: IItem, itemRarity: string): Promise<number> {
    const allItemsSameKey = await this.getAllItemsFromKey(targetContainer, item);
    let qty = 0;
    for (const item of allItemsSameKey) {
      if (item.stackQty && item.rarity === itemRarity) {
        qty += item.stackQty;
      } else if (item.rarity === itemRarity) {
        qty += 1;
      }
    }

    return qty;
  }

  public getTotalQtyByKey(items: IItem[]): Map<string, number> {
    const res: Map<string, number> = new Map();
    for (const item of items) {
      const itemKey = item.baseKey;
      let existing = res.get(itemKey);
      if (!existing) {
        existing = 0;
      }
      if (item.stackQty) {
        res.set(itemKey, existing + item.stackQty);
      } else {
        res.set(itemKey, existing + 1);
      }
    }
    return res;
  }

  @TrackNewRelicTransaction()
  public async getAllItemsFromKey(targetContainer: IItemContainer, item: IItem): Promise<IItem[]> {
    const items: IItem[] = [];

    for (let i = 0; i < targetContainer.slotQty; i++) {
      const slotItem = targetContainer.slots?.[i] as unknown as IItem;

      if (!slotItem) continue;

      if (
        slotItem.key.replace(/-\d+$/, "").toString() === item.key.replace(/-\d+$/, "").toString() &&
        slotItem.rarity === item.rarity
      ) {
        const dbItem = (await Item.findById(slotItem._id).lean()) as unknown as IItem;

        dbItem && items.push(dbItem);
      }
    }

    return items;
  }

  @TrackNewRelicTransaction()
  public async updateItemOnSlot(
    slotIndex: number,
    targetContainer: IItemContainer,
    payload: Record<string, any>
  ): Promise<void> {
    // Input validation
    if (slotIndex < 0 || slotIndex >= targetContainer.slots.length) {
      throw new Error("Invalid slot index");
    }

    if (!payload || typeof payload !== "object" || Object.keys(payload).length === 0) {
      throw new Error("Payload must be a non-empty object");
    }

    const slotItem = targetContainer.slots[slotIndex];

    // Check if slotItem exists
    if (!slotItem) {
      throw new Error("No item found in the given slot");
    }

    // Updating the item
    targetContainer.slots[slotIndex] = {
      ...slotItem,
      ...payload,
    };

    try {
      // Updating the container and the item in the database concurrently
      await Promise.all([
        ItemContainer.updateOne(
          { _id: targetContainer._id },
          {
            $set: {
              [`slots.${slotIndex}`]: targetContainer.slots[slotIndex],
            },
          }
        ),
        Item.updateOne({ _id: slotItem._id }, { $set: { ...payload } }),
      ]);
    } catch (error) {
      // Error handling
      console.error(error);
      throw new Error("Failed to update the item on the slot");
    }
  }

  @TrackNewRelicTransaction()
  public async findItemSlotIndex(targetContainer: IItemContainer, itemId: string): Promise<number | undefined> {
    try {
      const container = (await ItemContainer.findById(targetContainer._id).lean()) as unknown as IItemContainer;

      if (!container) {
        throw new Error("Container not found");
      }

      if (container) {
        for (let i = 0; i < container.slotQty; i++) {
          const slotItem = container.slots?.[i] as unknown as IItem;

          if (!slotItem) continue;

          if (slotItem?._id.toString() === itemId.toString()) {
            return i;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  public findItemWithSameKey(targetContainer: IItemContainer, itemKey: string): IItem | undefined {
    try {
      for (let i = 0; i < targetContainer.slotQty; i++) {
        const slotItem = targetContainer.slots?.[i];

        if (!slotItem) continue;

        // TODO: Find a better way to do this
        if (slotItem.key.replace(/-\d+$/, "") === itemKey.replace(/-\d+$/, "")) {
          return slotItem;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  @TrackNewRelicTransaction()
  public findItemOnSlots(targetContainer: IItemContainer, itemId: string): IItem | undefined {
    try {
      if (!targetContainer) {
        throw new Error("Container not found");
      }

      for (let i = 0; i < targetContainer.slotQty; i++) {
        const slotItem = targetContainer.slots?.[i] as unknown as IItem;

        if (!slotItem) continue;

        if (slotItem._id.toString() === itemId.toString()) {
          console.log(`Found item ${slotItem.key} on slot ${i}`);
          return slotItem;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  @TrackNewRelicTransaction()
  public async deleteItemOnSlot(targetContainer: IItemContainer, itemId: string): Promise<boolean> {
    for (let i = 0; i < targetContainer.slotQty; i++) {
      const slotItem = targetContainer.slots?.[i] as unknown as IItem;

      if (!slotItem) continue;
      if (slotItem._id.toString() === itemId.toString()) {
        // Changing item slot to undefined, thus removing it
        targetContainer.slots[i] = null;

        await ItemContainer.updateOne(
          {
            _id: targetContainer._id,
          },
          {
            $set: {
              slots: {
                ...targetContainer.slots,
              },
            },
          }
        );

        return true;
      }
    }
    return false;
  }

  @TrackNewRelicTransaction()
  public async getAvailableQuantityOnSlotToStack(
    targetContainerId: string,
    itemKeyToBeAdded: string,
    qty: number
  ): Promise<number> {
    const targetContainer = (await ItemContainer.findById(targetContainerId).lean()) as unknown as IItemContainer;

    for (const slotItem of Object.values(targetContainer.slots)) {
      if (!slotItem) {
        return qty;
      } else if (slotItem as unknown as IItem) {
        const slotItemKey = (slotItem as unknown as IItem).key;
        const slotItemQty = (slotItem as unknown as IItem).stackQty;

        if (slotItemKey === itemKeyToBeAdded && slotItemQty) {
          const availableQty = (slotItem as unknown as IItem).maxStackSize - slotItemQty;
          if (availableQty === 0) continue;

          if (qty <= availableQty) {
            return qty;
          }

          return availableQty;
        }
      }
    }

    return 0;
  }

  @TrackNewRelicTransaction()
  public async hasAvailableSlot(
    targetContainerId: string,
    itemToBeAdded: IItem,
    checkForEmptyOnly: boolean = false
  ): Promise<boolean> {
    const targetContainer = (await ItemContainer.findById(targetContainerId).lean()) as unknown as IItemContainer;

    if (!targetContainer) {
      return false;
    }

    const hasEmptySlot = this.getFirstAvailableSlotId(targetContainer) !== null;

    if (hasEmptySlot) {
      return true;
    }

    if (!checkForEmptyOnly && itemToBeAdded.maxStackSize > 1) {
      // if item is stackable, check if there's a stackable item with the same type, and the stack is not full

      // loop through all slots
      for (const slot of Object.values(targetContainer.slots)) {
        const slotItem = slot as unknown as IItem;

        if (slotItem.maxStackSize > 1) {
          if (isSameKey(slotItem.key, itemToBeAdded.key) && slotItem.rarity === itemToBeAdded.rarity) {
            const futureStackQty = slotItem.stackQty! + itemToBeAdded.stackQty!;
            if (futureStackQty <= slotItem.maxStackSize) {
              return true;
            }
          }
        }
      }
    }

    return checkForEmptyOnly && Object.keys(targetContainer.slots).length < targetContainer.slotQty;
  }

  public getFirstAvailableSlotId(targetContainer: IItemContainer): number | null {
    if (!targetContainer.slots) {
      return null;
    }

    for (let i = 0; i < targetContainer.slotQty; i++) {
      if (!targetContainer.slots[i]) {
        return i;
      }
    }

    return null;
  }

  @TrackNewRelicTransaction()
  public async getFirstAvailableSlotIndex(
    targetContainer: IItemContainer,
    itemToBeAdded?: IItem
  ): Promise<number | null> {
    const itemContainer = (await ItemContainer.findById(targetContainer._id)
      .lean()
      .select("slots")) as unknown as IItemContainer;

    if (!itemContainer) {
      return null;
    }

    for (const [id, slot] of Object.entries(targetContainer.slots)) {
      const slotItem = slot as unknown as IItem;

      if (itemToBeAdded && slotItem && slotItem.maxStackSize > 1) {
        if (slotItem.baseKey === itemToBeAdded.baseKey && slotItem.rarity === itemToBeAdded.rarity) {
          const futureStackQty = slotItem.stackQty! + itemToBeAdded.stackQty!;
          if (futureStackQty <= slotItem.maxStackSize) {
            return Number(id);
          }
        }
      } else {
        if (!slotItem) {
          return Number(id);
        }
      }
    }

    return null;
  }

  @TrackNewRelicTransaction()
  public async addItemOnSlot(
    targetContainer: IItemContainer,
    itemToBeAdded: IItem,
    slotIndex: number
  ): Promise<boolean> {
    const targetContainerItem = (await ItemContainer.findById(targetContainer.id).lean()) as unknown as IItemContainer;

    if (!targetContainerItem) {
      return false;
    }

    const slotItem = targetContainerItem.slots[slotIndex] as unknown as IItem;

    if (!slotItem) {
      await ItemContainer.updateOne(
        {
          _id: targetContainerItem._id,
        },
        {
          $set: {
            [`slots.${slotIndex}`]: itemToBeAdded,
          },
        }
      );

      return true;
    }

    return false;
  }

  @TrackNewRelicTransaction()
  public async tryAddingItemOnFirstSlot(
    character: ICharacter,
    selectedItem: IItem,
    targetContainer: IItemContainer,
    dropOnMapIfFull: boolean = true
  ): Promise<boolean> {
    const hasSameItemOnSlot = this.findItemOnSlots(targetContainer, selectedItem._id);

    if (hasSameItemOnSlot && selectedItem.maxStackSize === 1) {
      return false;
    }

    const firstAvailableSlotIndex = await this.getFirstAvailableSlotIndex(targetContainer, selectedItem);

    if (firstAvailableSlotIndex === null) {
      if (!dropOnMapIfFull) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, your container is full.");
        return false;
      }

      // if inventory is full, just drop the item on the ground
      // we must do a .save operation here to send the related events
      await Item.updateOne(
        { _id: selectedItem._id },
        { $set: { x: character.x, y: character.y, scene: character.scene } }
      );

      await warnAboutItemChanges(selectedItem, "changes");

      return true;
    }

    if (firstAvailableSlotIndex >= 0) {
      targetContainer.slots[firstAvailableSlotIndex] = selectedItem;

      if (!selectedItem._id) {
        return false;
      }

      await ItemContainer.updateOne(
        { _id: targetContainer._id },
        { $set: { [`slots.${firstAvailableSlotIndex}`]: selectedItem } }
      );

      return true;
    }

    return false;
  }
}
