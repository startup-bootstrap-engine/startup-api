/* eslint-disable mongoose-lean/require-lean */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItemContainer as IItemContainerModel, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { blueprintManager } from "@providers/inversify/container";
import { ContainersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IEquipmentAndInventoryUpdatePayload, IItemContainer, ItemSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { Types } from "mongoose";

@provide(CharacterInventory)
export class CharacterInventory {
  constructor(private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public async getInventory(character: ICharacter): Promise<IItem | null> {
    if (!character.equipment) return null;

    const equipment = (await Equipment.findById(character.equipment)
      .lean({ virtuals: true, defaults: true })
      .cacheQuery({ cacheKey: `${character._id}-equipment` })) as IEquipment | null;

    if (!equipment) return null;

    const inventory = (await Item.findById(equipment.inventory)
      .lean({ virtuals: true, getters: true, defaults: true })
      .cacheQuery({ cacheKey: `${character._id}-inventory` })) as IItem | null;

    return inventory || null; // Return null explicitly
  }

  public async getInventoryItemContainer(character: ICharacter): Promise<IItemContainerModel | null> {
    const inventory = await this.getInventory(character);
    if (!inventory) return null;

    const inventoryContainer = (await ItemContainer.findOne({
      _id: inventory.itemContainer,
    }).lean()) as IItemContainerModel | null;
    return inventoryContainer || null;
  }

  @TrackNewRelicTransaction()
  public async getAllItemsFromContainer(itemContainerId: Types.ObjectId): Promise<IItem[]> {
    const itemContainer = (await ItemContainer.findById(itemContainerId).lean()) as IItemContainerModel | null;
    if (!itemContainer) throw new Error(`Container not found for itemContainerId: ${itemContainerId}`);

    const slotsArray = Object.values(itemContainer.slots).filter((slot) => slot !== null);

    const items = await Promise.all(slotsArray.map((slot: IItem) => Item.findById(slot._id).lean<IItem>()));
    return items.filter((item): item is IItem => item !== null);
  }

  @TrackNewRelicTransaction()
  public async getAllItemsFromInventory(character: ICharacter): Promise<Record<string, IItem[]> | null> {
    const nestedInventoryAndItems: Record<string, IItem[]> = {};

    try {
      const characterInventory = await this.getInventory(character);
      if (!characterInventory || !characterInventory.itemContainer) throw new Error("Character inventory not found");

      const mainInventory = await this.getAllItemsFromContainer(characterInventory.itemContainer);
      if (mainInventory.length === 0) return null;

      await this.getItemsRecursively(characterInventory.itemContainer, nestedInventoryAndItems);
      return nestedInventoryAndItems;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private async getItemsRecursively(
    inventoryId: Types.ObjectId,
    nestedInventoryAndItems: Record<string, IItem[]>
  ): Promise<void> {
    const inventory = await this.getAllItemsFromContainer(inventoryId);
    if (inventory.length > 0) {
      nestedInventoryAndItems[inventoryId.toString()] = inventory;

      const hasContainer = inventory.filter(
        (item) => item.type === "Container" && item.itemContainer && item.itemContainer !== inventoryId
      );
      if (hasContainer.length > 0) {
        await Promise.all(
          hasContainer.map((nestedBag) =>
            nestedBag.itemContainer
              ? this.getItemsRecursively(nestedBag.itemContainer, nestedInventoryAndItems)
              : Promise.resolve()
          )
        );
      }
    }
  }

  @TrackNewRelicTransaction()
  public async generateNewInventory(
    character: ICharacter,
    inventoryType: ContainersBlueprint,
    useExistingEquipment = false
  ): Promise<IEquipment> {
    let equipment: IEquipment;

    if (useExistingEquipment) {
      equipment = (await Equipment.findById(character.equipment)) as IEquipment;
      if (!equipment) throw new Error("Equipment not found");
    } else {
      equipment = new Equipment();
    }

    equipment.owner = character._id;
    const containerBlueprint = await blueprintManager.getBlueprint<IItem>("items", inventoryType);

    const bag = new Item({ ...containerBlueprint, owner: character._id, carrier: character._id, isEquipped: true });
    await bag.save();

    equipment.inventory = bag._id;
    await equipment.save();

    return equipment;
  }

  @TrackNewRelicTransaction()
  public async sendInventoryUpdateEvent(character: ICharacter): Promise<void> {
    const inventory = await this.getInventory(character);
    if (!inventory) return;

    const inventoryContainer = (await ItemContainer.findById(inventory.itemContainer).lean()) as IItemContainer | null;
    if (inventoryContainer) {
      this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
        character.channelId!,
        ItemSocketEvents.EquipmentAndInventoryUpdate,
        { inventory: inventoryContainer, openInventoryOnUpdate: false }
      );
    }
  }
}
