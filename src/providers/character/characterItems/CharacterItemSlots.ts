import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item, warnAboutItemChanges } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { isSameKey } from "@providers/dataStructures/KeyHelper";
import { ItemBaseKey } from "@providers/item/ItemBaseKey";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

import { provide } from "inversify-binding-decorators";

@provide(CharacterItemSlots)
export class CharacterItemSlots {
  constructor(private socketMessaging: SocketMessaging, private itemBaseKey: ItemBaseKey) {}

  @TrackNewRelicTransaction()
  public async getTotalQty(targetContainer: IItemContainer, item: IItem, itemRarity: string): Promise<number> {
    const allItemsSameKey = await this.getAllItemsFromKey(targetContainer, item);

    return allItemsSameKey.reduce((qty, currentItem) => {
      if (currentItem.rarity === itemRarity) {
        return qty + (currentItem.stackQty || 1);
      }
      return qty;
    }, 0);
  }

  public getTotalQtyByKey(items: IItem[]): Map<string, number> {
    const itemsMap = items.reduce((res, item) => {
      const itemKey = item.baseKey;
      const existing = res.get(itemKey) || 0;
      res.set(itemKey, existing + (item.stackQty || 1));
      return res;
    }, new Map<string, number>());

    return itemsMap;
  }

  @TrackNewRelicTransaction()
  public async getAllItemsFromKey(targetContainer: IItemContainer, item: IItem): Promise<IItem[]> {
    const itemIds = Object.values(targetContainer.slots)
      .filter(
        (slotItem: IItem) =>
          !!slotItem &&
          this.itemBaseKey.getBaseKey(slotItem.key) === this.itemBaseKey.getBaseKey(item.key) &&
          slotItem.rarity === item.rarity
      )
      .map((slotItem: IItem) => slotItem._id);

    return await Item.find({ _id: { $in: itemIds } }).lean({ virtuals: true, defaults: true });
  }

  @TrackNewRelicTransaction()
  public async updateItemOnSlot(
    slotIndex: number,
    targetContainer: IItemContainer,
    payload: Partial<IItem>
  ): Promise<void> {
    if (slotIndex < 0 || slotIndex >= targetContainer.slotQty) {
      throw new Error("Invalid slot index");
    }

    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("Payload must be a non-empty object");
    }

    const slotItem = targetContainer.slots[slotIndex] as IItem | null;

    if (!slotItem) {
      throw new Error("No item found in the given slot");
    }

    const updatedSlotItem = { ...slotItem, ...payload };

    try {
      await Promise.all([
        ItemContainer.updateOne({ _id: targetContainer._id }, { $set: { [`slots.${slotIndex}`]: updatedSlotItem } }),
        Item.updateOne({ _id: slotItem._id }, { $set: payload }),
      ]);

      targetContainer.slots[slotIndex] = updatedSlotItem;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update the item on the slot");
    }
  }

  @TrackNewRelicTransaction()
  public async findItemSlotIndex(targetContainer: IItemContainer, itemId: string): Promise<number | undefined> {
    const container = (await ItemContainer.findById(targetContainer._id).lean()) as IItemContainer | null;

    if (!container) {
      throw new Error("Container not found");
    }

    const slotIndex = Object.entries(container.slots).find(
      ([_, item]: [string, IItem | null]) => item?._id.toString() === itemId
    )?.[0] as number | undefined;

    return Number(slotIndex);
  }

  public findItemWithSameKey(targetContainer: IItemContainer, itemKey: string): IItem | undefined {
    return Object.values(targetContainer.slots).find(
      (slotItem: IItem) => slotItem && slotItem.key.replace(/-\d+$/, "") === itemKey.replace(/-\d+$/, "")
    ) as IItem | undefined;
  }

  public findItemOnSlots(targetContainer: IItemContainer, itemId: string): IItem | undefined {
    if (!targetContainer) {
      throw new Error("Container not found");
    }

    return Object.values(targetContainer.slots).find((slotItem: IItem) => slotItem?._id.toString() === itemId) as
      | IItem
      | undefined;
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
    const targetContainer = (await ItemContainer.findById(targetContainerId).lean()) as IItemContainer | null;

    if (!targetContainer) {
      throw new Error("Container not found");
    }

    for (const slotItem of Object.values(targetContainer.slots) as IItem[]) {
      if (!slotItem) {
        return qty;
      }

      if (slotItem.key === itemKeyToBeAdded && slotItem.stackQty !== undefined) {
        const availableQty = slotItem.maxStackSize - slotItem.stackQty;
        if (availableQty === 0) continue;

        return Math.min(qty, availableQty);
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
    const targetContainer = (await ItemContainer.findById(targetContainerId).lean()) as IItemContainer | null;

    if (!targetContainer) {
      return false;
    }

    const emptySlotIndex = Object.values(targetContainer.slots).findIndex((slot) => !slot);

    if (emptySlotIndex !== -1) {
      return true;
    }

    if (!checkForEmptyOnly && itemToBeAdded.maxStackSize > 1) {
      return Object.values(targetContainer.slots).some(
        (slotItem: IItem) =>
          slotItem &&
          slotItem.maxStackSize > 1 &&
          isSameKey(slotItem.key, itemToBeAdded.key) &&
          slotItem.rarity === itemToBeAdded.rarity &&
          (slotItem.stackQty ?? 0) + (itemToBeAdded.stackQty ?? 1) <= slotItem.maxStackSize
      );
    }

    return checkForEmptyOnly && Object.keys(targetContainer.slots).length < targetContainer.slotQty;
  }

  public getFirstAvailableSlotId(targetContainer: IItemContainer): number | null {
    const emptySlotIndex = Object.entries(targetContainer.slots).find(([_, slot]) => !slot)?.[0];
    return emptySlotIndex !== undefined ? Number(emptySlotIndex) : null;
  }

  @TrackNewRelicTransaction()
  public async getFirstAvailableSlotIndex(
    targetContainer: IItemContainer,
    itemToBeAdded?: IItem
  ): Promise<number | null> {
    const itemContainer = (await ItemContainer.findById(targetContainer._id)
      .lean()
      .select("slots")) as IItemContainer | null;

    if (!itemContainer) {
      return null;
    }

    for (const [index, slotItem] of Object.entries(itemContainer.slots) as [string, IItem | null][]) {
      if (!slotItem) {
        return Number(index);
      }

      if (
        itemToBeAdded &&
        slotItem.maxStackSize > 1 &&
        slotItem.baseKey === itemToBeAdded.baseKey &&
        slotItem.rarity === itemToBeAdded.rarity &&
        (slotItem.stackQty ?? 0) + (itemToBeAdded.stackQty ?? 1) <= slotItem.maxStackSize
      ) {
        return Number(index);
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
    const targetContainerItem = (await ItemContainer.findById(targetContainer._id).lean()) as IItemContainer | null;

    if (!targetContainerItem) {
      return false;
    }

    if (!targetContainerItem.slots[slotIndex]) {
      await ItemContainer.updateOne(
        { _id: targetContainerItem._id },
        { $set: { [`slots.${slotIndex}`]: itemToBeAdded } }
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
    const hasSameItemOnSlot = this.findItemOnSlots(targetContainer, selectedItem._id.toString());

    if (hasSameItemOnSlot && selectedItem.maxStackSize === 1) {
      return false;
    }

    const firstAvailableSlotIndex = await this.getFirstAvailableSlotIndex(targetContainer, selectedItem);

    if (firstAvailableSlotIndex === null) {
      if (!dropOnMapIfFull) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, your container is full.");
        return false;
      }

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
