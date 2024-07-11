import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { isSameKey } from "@providers/dataStructures/KeyHelper";
import { blueprintManager } from "@providers/inversify/container";

import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { ItemRarity } from "@providers/item/ItemRarity";
import { AvailableBlueprints, ContainersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { MathHelper } from "@providers/math/MathHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { Types } from "mongoose";
import { CharacterInventory } from "../CharacterInventory";
import { CharacterItemContainer } from "./CharacterItemContainer";
import { CharacterItemSlots } from "./CharacterItemSlots";

interface IDecrementItemByKeyResult {
  success: boolean;
  updatedQty: number;
}

@provide(CharacterItemInventory)
export class CharacterItemInventory {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemSlots: CharacterItemSlots,
    private mathHelper: MathHelper,
    private characterItemsContainer: CharacterItemContainer,
    private characterInventory: CharacterInventory,
    private itemRarity: ItemRarity,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  @TrackNewRelicTransaction()
  public async getAllItemsFromInventoryNested(character: ICharacter): Promise<IItem[]> {
    const inventory = await this.characterInventory.getInventory(character);
    const container = (await ItemContainer.findById(inventory?.itemContainer).lean()) as unknown as IItemContainer;
    if (!container) {
      return [];
    }

    return await this.getAllItemsFromContainer(container);
  }

  private async getAllItemsFromContainer(container: IItemContainer): Promise<IItem[]> {
    const cachedAllItems = await this.inMemoryHashTable.get("container-all-items", container._id);

    if (cachedAllItems) {
      return cachedAllItems as IItem[];
    }

    // Initialize the stack with the first container and depth
    const stack: Array<{ container: IItemContainer; depth: number }> = [{ container, depth: 0 }];
    const items: IItem[] = [];
    const processedContainers = new Set<string>();

    while (stack.length > 0) {
      const { container: currentContainer, depth } = stack.pop() as { container: IItemContainer; depth: number };

      if (depth > 100) {
        throw new Error("Maximum recursion depth exceeded");
      }

      const slots = currentContainer.slots as unknown as IItem[];

      for (const [, slot] of Object.entries(slots)) {
        if (slot) {
          const item = (await Item.findById(slot._id).lean({ virtuals: true, defaults: true })) as unknown as IItem;
          if (item) {
            items.push(item);

            if (item.type === ItemType.Container) {
              const nestedContainer = (await ItemContainer.findById(item.itemContainer).lean({
                virtuals: true,
                defaults: true,
              })) as unknown as IItemContainer;
              if (nestedContainer) {
                const nestedContainerIdStr = nestedContainer._id.toString();
                const isSelfReference = nestedContainerIdStr === currentContainer._id.toString();
                const hasProcessedContainer = processedContainers.has(nestedContainerIdStr);

                if (!isSelfReference && !hasProcessedContainer) {
                  stack.push({ container: nestedContainer, depth: depth + 1 });
                  processedContainers.add(nestedContainerIdStr);
                }
              }
            }
          }
        }
      }
    }
    await this.inMemoryHashTable.set("container-all-items", container._id, items);

    return items;
  }

  @TrackNewRelicTransaction()
  public async addItemToInventory(
    itemKey: string,
    character: ICharacter,
    extraProps?: Partial<IItem>
  ): Promise<boolean> {
    const BLUEPRINT_TYPE_ITEMS = "items";

    const inventory = await this.characterInventory.getInventory(character);

    if (!inventory?.itemContainer) {
      return false;
    }

    const blueprint = await blueprintManager.getBlueprint<IItem>(BLUEPRINT_TYPE_ITEMS, itemKey as AvailableBlueprints);

    if (!blueprint) {
      return false;
    }

    const item = this.createItemFromBlueprint(character, blueprint, extraProps);

    const rarityData = await this.itemRarity.setItemRarityOnCraft(character, item, character.skills as Types.ObjectId);

    this.updateItemWithRarityData(item, rarityData);

    if (item.subType === ItemSubType.Food) {
      const foodRarityData = await this.itemRarity.setItemRarityOnFoodCraft(
        character,
        item,
        character.skills as Types.ObjectId
      );

      this.updateItemWithFoodRarityData(item, foodRarityData);
    }

    // eslint-disable-next-line mongoose-lean/require-lean
    await item.save();

    return this.characterItemsContainer.addItemToContainer(item, character, inventory.itemContainer.toString());
  }

  private createItemFromBlueprint(character: ICharacter, blueprint: IItem, extraProps?: Partial<IItem>): IItem {
    return new Item({
      ...blueprint,
      ...extraProps,
      owner: character._id,
      carrier: character._id,
    });
  }

  private updateItemWithRarityData(item: IItem, rarityData: any): void {
    item.rarity = rarityData.rarity;
    item.attack = rarityData.attack;
    item.defense = rarityData.defense;
  }

  private updateItemWithFoodRarityData(item: IItem, foodRarityData: any): void {
    if (foodRarityData.healthRecovery > 0) {
      item.healthRecovery = foodRarityData.healthRecovery;
      item.usableEffectDescription = foodRarityData.usableEffectDescription;
    }

    item.rarity = foodRarityData.rarity;
  }

  @TrackNewRelicTransaction()
  public async decrementItemFromInventory(
    itemId: string,
    character: ICharacter,
    decrementQty: number
  ): Promise<boolean> {
    const inventory = (await this.characterInventory.getInventory(character)) as unknown as IItem;
    const inventoryItemContainer = (await ItemContainer.findById(inventory?.itemContainer).lean()) as IItemContainer;

    if (!inventoryItemContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! Inventory container not found.");
      return false;
    }

    const item = (await Item.findById(itemId).lean()) as unknown as IItem;
    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! Item not found.");
      return false;
    }

    // returned value is slot index + 1
    const slotIndex = await this.checkItemInInventory(itemId, character);
    if (!slotIndex) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! Item not found on character's inventory.");
      return false;
    }

    return this.decrementQty(item, slotIndex - 1, inventoryItemContainer, character, decrementQty);
  }

  @TrackNewRelicTransaction()
  public async countItemInNestedContainers(container: IItemContainer, itemKey: string): Promise<number> {
    const items = await this.getAllItemsFromContainer(container);
    const filteredItems = items.filter((item) => isSameKey(item.key, itemKey));
    return filteredItems.reduce((count, item) => count + item.stackQty!, 0);
  }

  @TrackNewRelicTransaction()
  public async decrementItemFromInventoryByKey(
    itemKey: string,
    character: ICharacter,
    decrementQty: number,
    rarity?: string
  ): Promise<boolean> {
    const inventory = (await this.characterInventory.getInventory(character)) as unknown as IItem;

    const inventoryItemContainer = await ItemContainer.findById(inventory?.itemContainer).lean<IItemContainer>();

    if (!inventoryItemContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! Inventory container not found.");
      return false;
    }

    const hasItem = await this.checkItemInInventoryByKey(itemKey, character, rarity);
    if (!hasItem) {
      return false;
    }

    return (await this.decrementItemFromContainerByKey(inventoryItemContainer, itemKey, decrementQty, rarity)).success;
  }

  /**
   * decrements item by key from nested item containers
   * @param itemKey
   * @param character
   * @param decrementQty
   * @returns true if was successful and the updated decrementQty
   */
  @TrackNewRelicTransaction()
  public async decrementItemFromNestedInventoryByKey(
    itemKey: string,
    character: ICharacter,
    decrementQty: number
  ): Promise<IDecrementItemByKeyResult> {
    const itemContainers = await ItemContainer.find({ owner: character._id, name: { $ne: "Depot" } }).lean<
      IItemContainer[]
    >();

    if (!itemContainers) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! Inventory container not found.");
      return { success: false, updatedQty: decrementQty };
    }

    let hasItem = false;
    for (const container of itemContainers) {
      hasItem = !!(await this.checkItemInContainerByKey(itemKey, container));
      if (hasItem) {
        const { success, updatedQty: remainingQty } = await this.decrementItemFromContainerByKey(
          container,
          itemKey,
          decrementQty
        );
        if (!success || (success && remainingQty === 0)) {
          return { success, updatedQty: remainingQty };
        }

        decrementQty = remainingQty;
      }
    }

    if (hasItem && decrementQty > 0) {
      return { success: true, updatedQty: decrementQty };
    }

    return { success: false, updatedQty: decrementQty };
  }

  @TrackNewRelicTransaction()
  public async deleteItemFromInventory(itemId: string, character: ICharacter): Promise<boolean> {
    const doesCharacterHaveItemInInventory = await this.checkItemInInventory(itemId, character);

    if (!doesCharacterHaveItemInInventory) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Oops! The character does not have the item to be deleted on the inventory."
      );
      return false;
    }

    const item = await Item.findById(itemId).lean<IItem>();

    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The item to be deleted was not found.");
      return false;
    }

    return await this.removeItemFromInventory(item._id, character);
  }

  /**
   * Returns the item id if it finds it. Otherwise, returns undefined
   */
  @TrackNewRelicTransaction()
  public async checkItemInInventoryByKey(
    itemKey: string,
    character: ICharacter,
    rarity?: string
  ): Promise<string | undefined> {
    const inventory = (await this.characterInventory.getInventory(character)) as unknown as IItem;

    const inventoryItemContainer = await ItemContainer.findById(inventory?.itemContainer).lean<IItemContainer>();

    if (!inventoryItemContainer) {
      return;
    }

    return this.checkItemInContainerByKey(itemKey, inventoryItemContainer, rarity);
  }

  @TrackNewRelicTransaction()
  private async checkItemInContainerByKey(
    itemKey: string,
    container: IItemContainer,
    rarity?: string
  ): Promise<string | undefined> {
    for (let i = 0; i < container.slotQty; i++) {
      let slotItem = container.slots[i] as unknown as IItem;
      if (!slotItem) continue;

      if (!slotItem.key) {
        slotItem = (await Item.findById(slotItem as any).lean<IItem>()) as unknown as IItem;
      }
      if (isSameKey(slotItem.key, itemKey) && (rarity === undefined || slotItem.rarity === rarity)) {
        return slotItem._id;
      }
    }
  }

  /**
   * Returns the item id as array if it finds it and quantity. Otherwise, returns empty list
   */
  @TrackNewRelicTransaction()
  public async checkItemsInInventoryByKey(
    itemKey: string,
    character: ICharacter,
    rarity?: string
  ): Promise<{ slotListId: string[]; qty: number }> {
    const inventory = (await this.characterInventory.getInventory(character)) as unknown as IItem;

    const inventoryItemContainer = await ItemContainer.findById(inventory?.itemContainer).lean<IItemContainer>();

    if (!inventoryItemContainer) {
      return {
        slotListId: [],
        qty: 0,
      };
    }

    return this.checkItemsInContainerByKey(itemKey, inventoryItemContainer, rarity);
  }

  @TrackNewRelicTransaction()
  private async checkItemsInContainerByKey(
    itemKey: string,
    container: IItemContainer,
    rarity?: string
  ): Promise<{ slotListId: string[]; qty: number }> {
    let qty = 0;
    const slotListId: string[] = [];
    for (let i = 0; i < container.slotQty; i++) {
      let slotItem = container.slots[i] as unknown as IItem;
      if (!slotItem) continue;

      if (!slotItem.key) {
        slotItem = (await Item.findById(slotItem as any).lean<IItem>()) as unknown as IItem;
      }
      if (isSameKey(slotItem.key, itemKey) && (rarity === undefined || slotItem.rarity === rarity)) {
        qty += slotItem.stackQty ?? 0;
      }
    }

    return {
      slotListId,
      qty,
    };
  }

  /**
   * Returns the (slot index + 1) if it finds it. Otherwise, returns undefined
   */
  @TrackNewRelicTransaction()
  public async checkItemInInventory(itemId: string, character: ICharacter): Promise<number | undefined> {
    const inventory = (await this.characterInventory.getInventory(character)) as unknown as IItem;
    const inventoryItemContainer = await ItemContainer.findById(inventory?.itemContainer).lean<IItemContainer>();

    if (!inventoryItemContainer) {
      return;
    }

    return this.checkItemInContainer(itemId, inventoryItemContainer);
  }

  private checkItemInContainer(itemId: string, container: IItemContainer): number | undefined {
    for (let i = 0; i < container.slotQty; i++) {
      const slotItem = container.slots?.[i];

      if (!slotItem) continue;
      if (slotItem._id.toString() === itemId.toString()) {
        return i + 1;
      }
    }
  }

  private async decrementItemFromContainerByKey(
    container: IItemContainer,
    itemKey: string,
    decrementQty: number,
    rarity?: string
  ): Promise<IDecrementItemByKeyResult> {
    for (let i = 0; i < container.slotQty; i++) {
      if (decrementQty <= 0) break;

      let slotItem = container.slots[i] as unknown as IItem;
      if (!slotItem) continue;

      if (!slotItem.key) {
        slotItem = (await Item.findById(slotItem as any).lean<IItem>()) as unknown as IItem;
      }

      let result = true;

      if (isSameKey(slotItem.key, itemKey) && (rarity === undefined || slotItem.rarity === rarity)) {
        if (slotItem.maxStackSize > 1) {
          // if its stackable, decrement the stack

          let remaining = 0;

          if (decrementQty <= slotItem.stackQty!) {
            remaining = this.mathHelper.fixPrecision(slotItem.stackQty! - decrementQty);
            decrementQty = 0;
          } else {
            decrementQty = this.mathHelper.fixPrecision(decrementQty - slotItem.stackQty!);
          }

          if (remaining > 0) {
            await this.characterItemSlots.updateItemOnSlot(i, container, {
              stackQty: remaining,
            });
          } else {
            // all stackable items qty consumed
            // remove it from container
            result = await this.removeItemFromContainer(slotItem, container);
            // we also need to delete item from items table
            await Item.deleteOne({ _id: slotItem._id });

            // we need to fetch updated container in case some quantity remains to be substracted
            if (result && decrementQty > 0) {
              const updatedCont = await ItemContainer.findById(container._id).lean<IItemContainer>();
              if (!updatedCont) {
                result = false;
                break;
              }
              container = updatedCont;
            }
          }
        } else {
          // if its not stackable, just remove it
          result = await this.removeItemFromContainer(slotItem, container);
          // we also need to delete item from items table
          await Item.deleteOne({ _id: slotItem._id });

          decrementQty--;
        }
      }

      if (!result) {
        return { success: false, updatedQty: decrementQty };
      }
    }
    return { success: true, updatedQty: decrementQty };
  }

  private async removeItemFromInventory(itemId: string, character: ICharacter): Promise<boolean> {
    const item = (await Item.findById(itemId)) as unknown as IItem;

    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The item to be removed was not found.");
      return false;
    }

    const inventory = (await this.characterInventory.getInventory(character)) as unknown as IItem;

    if (!inventory) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The character does not have an inventory.");
      return false;
    }

    const inventoryItemContainer = await ItemContainer.findById(inventory.itemContainer);

    if (!inventoryItemContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The character does not have an inventory.");
      return false;
    }

    const removed = await this.removeItemFromContainer(item, inventoryItemContainer);
    if (removed) {
      return true;
    }

    this.socketMessaging.sendErrorMessageToCharacter(
      character,
      "Oops! Something went wrong while trying to remove the item from the inventory."
    );

    return false;
  }

  private async removeItemFromContainer(item: IItem, container: IItemContainer): Promise<boolean> {
    // Check if the item exists in the container
    const slotNumber = Object.keys(container.slots).find(
      (key) => container.slots[key] && container.slots[key]._id.toString() === item._id.toString()
    );

    if (!slotNumber) {
      return false;
    }

    // Set the slot to null
    container.slots[slotNumber] = null;

    // Update the database
    try {
      await ItemContainer.updateOne({ _id: container._id }, { $set: { slots: { ...container.slots } } });
    } catch (error) {
      console.error("Failed to update database:", error);
      return false;
    }

    // Update the in-memory hash table
    await this.inMemoryHashTable.delete("container-all-items", container._id);

    return true;
  }

  @TrackNewRelicTransaction()
  public async addEquipmentToCharacter(character: ICharacter): Promise<void> {
    const equipment = await this.createEquipmentWithInventory(character);

    character.equipment = equipment._id;
    await character.save();
  }

  @TrackNewRelicTransaction()
  public async createEquipmentWithInventory(character: ICharacter): Promise<IEquipment> {
    const equipment = new Equipment();
    equipment.owner = character._id;

    const blueprintData = await blueprintManager.getBlueprint<IItem>("items", ContainersBlueprint.Backpack);

    const backpack = new Item({
      ...blueprintData,
      owner: character._id,
      carrier: character._id,
      isEquipped: true,
    });
    await backpack.save();

    equipment.inventory = backpack._id;
    await equipment.save();

    return equipment;
  }

  private async decrementQty(
    slotItem: IItem,
    slotIndex: number,
    inventoryItemContainer: IItemContainer,
    character: ICharacter,
    decrementQty: number
  ): Promise<boolean> {
    let result = false;
    if (slotItem.maxStackSize > 1) {
      // if its stackable, decrement the stack
      let remaining = 0;

      if (decrementQty <= slotItem.stackQty!) {
        remaining = this.mathHelper.fixPrecision(slotItem.stackQty! - decrementQty);
      }

      if (remaining > 0) {
        await this.characterItemSlots.updateItemOnSlot(slotIndex, inventoryItemContainer, {
          stackQty: remaining,
        });
        result = true;
      } else {
        result = await this.deleteItemFromInventory(slotItem._id, character);
        // we also need to delete item from items table
        await Item.deleteOne({ _id: slotItem._id });
      }
    } else {
      // if its not stackable, just remove it
      result = await this.deleteItemFromInventory(slotItem._id, character);
      // we also need to delete item from items table
      await Item.deleteOne({ _id: slotItem._id });
    }
    return result;
  }

  @TrackNewRelicTransaction()
  public async decrementItemFromContainer(
    itemId: string,
    character: ICharacter,
    decrementQty: number,
    inventoryId: string
  ): Promise<boolean> {
    const itemContainer = (await ItemContainer.findById(inventoryId)) as IItemContainer;

    if (!itemContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! Inventory container not found.");
      return false;
    }

    const item = (await Item.findById(itemId).lean()) as IItem;
    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! Item not found.");
      return false;
    }

    const slotIndex = this.checkItemInContainer(itemId, itemContainer);
    if (!slotIndex) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! Item not found on character's inventory.");
      return false;
    }

    const decreasedItem = this.decrementQtyInContainer(item, slotIndex - 1, itemContainer, character, decrementQty);

    return decreasedItem;
  }

  private async decrementQtyInContainer(
    slotItem: IItem,
    slotIndex: number,
    inventoryItemContainer: IItemContainer,
    character: ICharacter,
    decrementQty: number
  ): Promise<boolean> {
    let result = false;
    try {
      if (slotItem.maxStackSize > 1) {
        let remaining = 0;

        if (decrementQty <= slotItem.stackQty!) {
          remaining = this.mathHelper.fixPrecision(slotItem.stackQty! - decrementQty);
        }

        if (remaining > 0) {
          await this.characterItemSlots.updateItemOnSlot(slotIndex, inventoryItemContainer, {
            stackQty: remaining,
          });
          result = true;
        } else {
          result = await this.deleteItemInContainer(slotItem._id, character, inventoryItemContainer);
          await Item.deleteOne({ _id: slotItem._id });
        }
      } else {
        result = await this.deleteItemInContainer(slotItem._id, character, inventoryItemContainer);
        await Item.deleteOne({ _id: slotItem._id });
      }

      return result;
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  @TrackNewRelicTransaction()
  public async deleteItemInContainer(
    itemId: string,
    character: ICharacter,
    inventoryItemContainer: IItemContainer
  ): Promise<boolean> {
    const doesCharacterHaveItemInInventory = this.checkItemInContainer(itemId, inventoryItemContainer);

    if (!doesCharacterHaveItemInInventory) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Oops! The character does not have the item to be deleted on the inventory."
      );
      return false;
    }

    const item = (await Item.findById(itemId).lean()) as IItem;

    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Oops! The item to be deleted was not found.");
      return false;
    }

    return await this.removeItemFromContainer(item._id, inventoryItemContainer);
  }
}
