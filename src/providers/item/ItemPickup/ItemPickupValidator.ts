import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { CharacterItems } from "@providers/character/characterItems/CharacterItems";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { ITEM_PICKUP_DISTANCE_THRESHOLD } from "@providers/constants/ItemConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { EquipmentEquip } from "@providers/equipment/EquipmentEquip";
import { MapHelper } from "@providers/map/MapHelper";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { PlantHarvest } from "@providers/plant/PlantHarvest";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemPickup, ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { isEmpty } from "lodash";
import { clearCacheForKey } from "speedgoose";

@provide(ItemPickupValidator)
export class ItemPickupValidator {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemSlots: CharacterItemSlots,
    private mapHelper: MapHelper,
    private characterWeight: CharacterWeightQueue,
    private movementHelper: MovementHelper,
    private characterItems: CharacterItems,
    private characterValidation: CharacterValidation,
    private characterInventory: CharacterInventory,
    private equipmentEquip: EquipmentEquip,
    private plantHarvest: PlantHarvest,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  @TrackNewRelicTransaction()
  public async isItemPickupValid(itemPickupData: IItemPickup, character: ICharacter): Promise<boolean | IItem> {
    const item = (await Item.findById(itemPickupData.itemId).lean({ virtuals: true, defaults: true })) as IItem;

    if (!item) {
      this.sendErrorMessage(character, "Sorry, the item to be picked up was not found.");
      return false;
    }

    await this.clearCharacterCache(character, itemPickupData.fromContainerId!, itemPickupData.toContainerId, item);

    if (item.isStatic) {
      if (item.type === ItemType.Plant) {
        await this.plantHarvest.harvestPlant(item, character);
        return false;
      }
      this.sendErrorMessage(character, "Sorry, this item cannot be picked");
      return false;
    }

    const inventory = await this.characterInventory.getInventory(character);

    if (itemPickupData.toContainerId === "") {
      itemPickupData.toContainerId = inventory?.itemContainer as string;
    }

    const isPickedItemAlreadyOnInventory = !item.scene;

    if (this.shouldEquipInventoryItem(item, inventory, itemPickupData)) {
      await this.equipmentEquip.equipInventory(character, item._id);
      return false;
    }

    if (
      this.isItemContainerIntoItself(item, itemPickupData, character) ||
      !(await this.hasEquipmentContainer(character, item, inventory)) ||
      !this.hasInventoryForItem(character, item, inventory) ||
      !(await this.hasAvailableSlot(itemPickupData, item, character)) ||
      !this.canPickupItemFromMap(character, item) ||
      !(await this.canCarryAdditionalWeight(character, item)) ||
      !this.canStoreItem(character, item) ||
      (!isPickedItemAlreadyOnInventory && !this.isInRangeForPickup(item, character, itemPickupData)) ||
      !this.canPickupNotOwnedItem(character, item) ||
      !(await this.canPickupAlreadyOwnedItem(character, item, inventory, itemPickupData))
    ) {
      return false;
    }

    if (!this.characterValidation.hasBasicValidation(character)) {
      return false;
    }

    return item;
  }

  private async clearCharacterCache(
    character: ICharacter,
    fromContainerId: string,
    toContainerId: string,
    itemToBeDropped: IItem
  ): Promise<void> {
    const promises = [
      fromContainerId && this.inMemoryHashTable.delete("container-all-items", fromContainerId),
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

  private sendErrorMessage(character: ICharacter, message: string): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, message);
  }

  private shouldEquipInventoryItem(item: IItem, inventory: any, itemPickupData: IItemPickup): boolean {
    return !inventory && item.isItemContainer && isEmpty(itemPickupData.toContainerId);
  }

  private isItemContainerIntoItself(item: IItem, itemPickupData: IItemPickup, character: ICharacter): boolean {
    if (item.itemContainer && String(itemPickupData.toContainerId) === String(item.itemContainer)) {
      this.sendErrorMessage(character, "Sorry, you can't pick up an item container into itself.");
      return true;
    }
    return false;
  }

  private async hasEquipmentContainer(character: ICharacter, item: IItem, inventory: any): Promise<boolean> {
    const isInventoryItem = item.isItemContainer && inventory === null;
    if (isInventoryItem) {
      const equipmentContainer = await Equipment.findById(character.equipment)
        .lean({ virtuals: true, defaults: true })
        .cacheQuery({
          cacheKey: `${character._id}-equipment`,
        });
      if (!equipmentContainer) {
        this.sendErrorMessage(character, "Sorry, equipment container not found");
        return false;
      }
    }
    return true;
  }

  private hasInventoryForItem(character: ICharacter, item: IItem, inventory: any): boolean {
    const isInventoryItem = item.isItemContainer && inventory === null;
    if (!inventory && !item.isItemContainer && !isInventoryItem) {
      this.sendErrorMessage(character, "Sorry, you need an inventory to pick this item.");
      return false;
    }
    return true;
  }

  private async hasAvailableSlot(itemPickupData: IItemPickup, item: IItem, character: ICharacter): Promise<boolean> {
    const hasAvailableSlot = await this.characterItemSlots.hasAvailableSlot(itemPickupData.toContainerId, item);
    if (!hasAvailableSlot) {
      this.sendErrorMessage(character, "Sorry, your container is full.");
      return false;
    }
    return true;
  }

  private canPickupItemFromMap(character: ICharacter, item: IItem): boolean {
    const isItemOnMap =
      this.mapHelper.isCoordinateValid(item.x) && this.mapHelper.isCoordinateValid(item.y) && item.scene;

    if (isItemOnMap && character.scene !== item.scene) {
      this.sendErrorMessage(character, "Sorry, you can't pick up items from another map.");
      return false;
    }

    return true;
  }

  private async canCarryAdditionalWeight(character: ICharacter, item: IItem): Promise<boolean> {
    const weight = await this.characterWeight.getWeight(character);
    const maxWeight = await this.characterWeight.getMaxWeight(character);
    const ratio = (weight + item.weight) / maxWeight;

    if (ratio > 4) {
      this.sendErrorMessage(character, "Sorry, you are already carrying too much weight!");
      return false;
    }

    return true;
  }

  private canStoreItem(character: ICharacter, item: IItem): boolean {
    if (!item.isStorable) {
      this.sendErrorMessage(character, "Sorry, you cannot store this item.");
      return false;
    }

    return true;
  }

  private isInRangeForPickup(item: IItem, character: ICharacter, itemPickupData: IItemPickup): boolean {
    if (item.x !== undefined && item.y !== undefined && item.scene !== undefined) {
      const underRange = this.movementHelper.isUnderRange(
        character.x,
        character.y,
        itemPickupData.x,
        itemPickupData.y,
        ITEM_PICKUP_DISTANCE_THRESHOLD
      );

      if (!underRange) {
        this.sendErrorMessage(character, "Sorry, you are too far away to pick up this item.");
        return false;
      }
    }
    return true;
  }

  private canPickupNotOwnedItem(character: ICharacter, item: IItem): boolean {
    const isItemOnMap =
      this.mapHelper.isCoordinateValid(item.x) && this.mapHelper.isCoordinateValid(item.y) && item.scene;

    if (!isItemOnMap) {
      if (item.owner && item.owner?.toString() !== character._id.toString()) {
        this.sendErrorMessage(character, "Sorry, this item is not yours.");
        return false;
      }
    }

    return true;
  }

  private async canPickupAlreadyOwnedItem(
    character: ICharacter,
    item: IItem,
    inventory: any,
    itemPickupData: IItemPickup
  ): Promise<boolean> {
    const isInventoryItem = item.isItemContainer && inventory === null;
    const characterAlreadyHasItem = await this.characterItems.hasItem(
      item._id,
      character,
      isInventoryItem ? "equipment" : "inventory"
    );
    if (characterAlreadyHasItem && itemPickupData.toContainerId === inventory?._id.toString()) {
      this.sendErrorMessage(character, "Sorry, you already have this item.");
      return false;
    }

    return true;
  }
}
