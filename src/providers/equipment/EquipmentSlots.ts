import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemBuff } from "@providers/character/characterBuff/CharacterItemBuff";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { isSameKey } from "@providers/dataStructures/KeyHelper";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IEquipmentSet } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _, { camelCase } from "lodash";

export type EquipmentSlotTypes =
  | "head"
  | "neck"
  | "leftHand"
  | "rightHand"
  | "ring"
  | "legs"
  | "boot"
  | "accessory"
  | "armor"
  | "inventory";

@provide(EquipmentSlots)
export class EquipmentSlots {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemContainer: CharacterItemContainer,
    private characterInventory: CharacterInventory,
    private characterItemBuff: CharacterItemBuff,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  private slots: EquipmentSlotTypes[] = [
    "head",
    "neck",
    "leftHand",
    "rightHand",
    "ring",
    "legs",
    "boot",
    "accessory",
    "armor",
    "inventory",
  ];

  @TrackNewRelicTransaction()
  public async addItemToEquipmentSlot(
    character: ICharacter,
    item: IItem,
    equipment: IEquipment,
    originContainer: IItemContainer
  ): Promise<boolean> {
    const availableSlot = await this.getAvailableSlot(item, equipment);

    if (!availableSlot) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you don't have any available slots for this item."
      );
      return false;
    }

    const removeItem = await this.characterItemContainer.removeItemFromContainer(item, character, originContainer);

    if (!removeItem) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, failed to remove item from origin container."
      );
      return false;
    }

    if (item.maxStackSize > 1) {
      const equipmentSet = await this.getEquipmentSlots(equipment.owner?.toString()!, equipment._id);

      const targetSlotItemId = equipmentSet[availableSlot];
      const targetSlotItem = await Item.findById(targetSlotItemId).lean();

      if (!targetSlotItem) {
        await Equipment.findByIdAndUpdate(equipment._id, { [availableSlot]: item }, { new: true }).lean();
        await this.inMemoryHashTable.delete("equipment-slots", character._id.toString());
        return true;
      }

      const futureStackSize = targetSlotItem.stackQty! + item.stackQty!;

      if (isSameKey(targetSlotItem?.key, item.key)) {
        if (futureStackSize <= targetSlotItem?.maxStackSize) {
          await Item.findByIdAndUpdate(targetSlotItem._id, { stackQty: futureStackSize }).lean();
          await this.inMemoryHashTable.delete("equipment-slots", character._id.toString());
          return true;
        } else {
          const difference = Math.abs(targetSlotItem?.maxStackSize - futureStackSize);

          await Item.findByIdAndUpdate(targetSlotItem._id, { stackQty: targetSlotItem?.maxStackSize }).lean();
          const updatedItem = await Item.findByIdAndUpdate(item._id, { stackQty: difference }, { new: true }).lean();

          const inventory = await this.characterInventory.getInventory(character);
          const inventoryContainer = await ItemContainer.findById(inventory?.itemContainer).lean();

          if (!inventoryContainer) {
            throw new Error(`Item container ${inventory?._id} not found`);
          }

          const addDiffToContainer = await this.characterItemContainer.addItemToContainer(
            updatedItem as IItem,
            character,
            inventoryContainer._id
          );
          await this.inMemoryHashTable.delete("equipment-slots", character._id.toString());

          return addDiffToContainer;
        }
      }

      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you don't have any available slots for this item."
      );

      return false;
    }

    await Equipment.findByIdAndUpdate(equipment._id, { [availableSlot]: item }, { new: true }).lean();
    await this.inMemoryHashTable.delete("equipment-slots", character._id.toString());

    return true;
  }

  @TrackNewRelicTransaction()
  public async areAllowedSlotsAvailable(slots: string[], equipment: IEquipment): Promise<boolean> {
    const equipmentSlots = await this.getEquipmentSlots(equipment.owner?.toString()!, equipment._id);

    for (const slotData of slots) {
      const slot = camelCase(slotData) as EquipmentSlotTypes;

      if (equipmentSlots[slot] === undefined) {
        return true;
      }

      const equippedItem = equipmentSlots[slot] as unknown as IItem;
      const isStackable = equippedItem.maxStackSize > 1;

      if (!isStackable) {
        return false;
      }

      // stackable items

      if (equippedItem.stackQty === equippedItem.maxStackSize) {
        return false;
      }
    }

    return true;
  }

  @TrackNewRelicTransaction()
  public async getAvailableSlot(item: IItem, equipment: IEquipment): Promise<string> {
    const equipmentSet = await this.getEquipmentSlots(equipment.owner?.toString()!, equipment._id);

    let availableSlot = "";
    const itemSlotTypes = this.slots;

    if (!item.allowedEquipSlotType) {
      throw new Error(`Item ${item.key} does not have allowedEquipSlotType`);
    }

    for (const allowedSlotType of item?.allowedEquipSlotType!) {
      const allowedSlotTypeCamelCase = camelCase(allowedSlotType);
      const itemSubTypeCamelCase = camelCase(item.subType);

      const slotType = this.getSlotType(itemSlotTypes, allowedSlotTypeCamelCase, itemSubTypeCamelCase);

      const targetSlot = equipmentSet[slotType];

      if (item.maxStackSize > 1) {
        // if target slot is empty, just add the stackable item
        if (!targetSlot) {
          availableSlot = slotType;
          break;
        }

        // if not, check if its same key and it we can still stack it
        if (isSameKey(targetSlot?.key, item.key)) {
          if (targetSlot.stackQty! <= targetSlot.maxStackSize) {
            availableSlot = slotType;
            break;
          }
        }

        continue;
      }

      if (targetSlot === undefined) {
        availableSlot = slotType;
        break;
      }
    }

    return availableSlot;
  }

  @TrackNewRelicTransaction()
  public async getEquipmentSlots(characterId: string, equipmentId: string): Promise<IEquipmentSet> {
    const hasCache = (await this.inMemoryHashTable.get("equipment-slots", characterId)) as IEquipmentSet;

    if (hasCache) {
      return hasCache;
    }

    const equipment = await Equipment.findById(equipmentId)
      .lean()
      .cacheQuery({
        cacheKey: `${characterId}-equipment`,
      });

    if (!equipment) {
      throw new Error(`Equipment ${equipmentId} not found`);
    }

    const result = {
      _id: equipment._id.toString(),
    };

    for (const slot of this.slots) {
      if (equipment[slot]) {
        result[slot] = await Item.findById(equipment[slot]).lean({ virtuals: true, defaults: true });
      }
    }

    const cleanedResult = _.omitBy(result, _.isUndefined);

    await this.inMemoryHashTable.set("equipment-slots", characterId, cleanedResult);

    return cleanedResult as unknown as IEquipmentSet;
  }

  @TrackNewRelicTransaction()
  public async hasItemByKeyOnSlot(
    character: ICharacter,
    key: string,
    slot: EquipmentSlotTypes
  ): Promise<IItem | undefined> {
    // TODO: Cache this
    const equipment = await Equipment.findById(character.equipment).lean().populate(this.slots.join(" ")).exec();

    if (!equipment) {
      return undefined;
    }

    const item = equipment[slot] as unknown as IItem;

    if (!item) {
      return undefined;
    }

    if (isSameKey(item.key, key)) {
      return item;
    }
  }

  @TrackNewRelicTransaction()
  public async removeItemFromSlot(character: ICharacter, key: string, slot: EquipmentSlotTypes): Promise<boolean> {
    const equipment = await Equipment.findById(character.equipment).populate(this.slots.join(" ")).lean().exec();

    if (!equipment) {
      return false;
    }

    const item = equipment[slot] as unknown as IItem;

    if (!item) {
      return false;
    }

    if (isSameKey(item.key, key)) {
      const update = { [slot]: null };
      await Equipment.findByIdAndUpdate(character.equipment, update, { new: true }).lean();
      await this.characterItemBuff.disableItemBuff(character, item._id);
      return true;
    }

    return false;
  }

  private getSlotType(itemSlotTypes: string[], slotType: string, subType: string): string {
    if (!itemSlotTypes.includes(slotType)) {
      return subType;
    }
    return slotType;
  }
}
