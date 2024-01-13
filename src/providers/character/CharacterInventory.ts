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
    if (!character.equipment) {
      return null;
    }

    const equipment = (await Equipment.findById(character.equipment)
      .lean({
        virtuals: true,
        defaults: true,
      })
      .cacheQuery({
        cacheKey: `${character._id}-equipment`,
      })) as IEquipment;

    if (equipment) {
      const inventory = await Item.findById(equipment.inventory)
        .lean({
          virtuals: true,
          getters: true,
          defaults: true,
        })
        .cacheQuery({
          cacheKey: `${character._id}-inventory`,
        });

      if (inventory) {
        return inventory as IItem;
      }
    }

    return null; //! some areas of the codebase strictly check for null, so return it instead of undefined
  }

  public async getInventoryItemContainer(character: ICharacter): Promise<IItemContainerModel | null> {
    const inventory = await this.getInventory(character);

    if (!inventory) {
      return null;
    }

    const inventoryContainer = (await ItemContainer.findOne({
      _id: inventory?.itemContainer,
    }).lean()) as unknown as IItemContainerModel;

    if (!inventoryContainer) {
      return null;
    }

    return inventoryContainer;
  }

  @TrackNewRelicTransaction()
  public async getAllItemsFromContainer(itemContainerId: Types.ObjectId): Promise<IItem[]> {
    try {
      const itemContainer = (await ItemContainer.findById(itemContainerId).lean()) as IItemContainerModel;

      if (!itemContainer) {
        throw new Error(`Container not found for itemContainerId: ${itemContainerId}`);
      }

      const slots = itemContainer.slots as IItem[];
      const slotsArray = Object.values(slots);

      const itemsPromises = slotsArray
        .filter((slot) => slot !== null)
        .map(async (slot) => {
          return (await Item.findById(slot._id).lean()) as IItem;
        });

      const items = await Promise.all(itemsPromises);
      return items.filter((item): item is IItem => item !== null);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  /**
   * This function retrieves all items from a character container(inventory), including items that are
   * inside any nested bags.
   *
   */
  @TrackNewRelicTransaction()
  public async getAllItemsFromInventory(character: ICharacter): Promise<Record<string, IItem[]> | null> {
    const nestedInventoryAndItems: Record<string, IItem[]> = {};

    try {
      const characterInventory = await this.getInventory(character);

      if (!characterInventory || !characterInventory.itemContainer) {
        throw new Error("Character inventory not found");
      }

      const mainInventory = await this.getAllItemsFromContainer(characterInventory.itemContainer);

      if (mainInventory.length === 0) {
        return null;
      }

      await this.getItemsRecursively(characterInventory.itemContainer, nestedInventoryAndItems);

      return nestedInventoryAndItems;
    } catch (err) {
      console.error(err);

      return null;
    }
  }

  @TrackNewRelicTransaction()
  async getItemsRecursively(
    inventoryId: Types.ObjectId,
    nestedInventoryAndItems: Record<string, IItem[]>
  ): Promise<void> {
    const inventory = await this.getAllItemsFromContainer(inventoryId);

    if (inventory.length > 0) {
      nestedInventoryAndItems[inventoryId.toString()] = inventory;

      const hasContainer = inventory.filter((item) => item.type === "Container" && item.itemContainer !== inventoryId);

      if (hasContainer.length > 0) {
        // Map and await all recursive calls
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
    useExistingEquipment: boolean = false
  ): Promise<IEquipment> {
    let equipment;

    if (!useExistingEquipment) {
      equipment = new Equipment();
    } else {
      equipment = await Equipment.findById(character.equipment);

      if (!equipment) {
        throw new Error("Equipment not found");
      }
    }

    equipment.owner = character._id;

    const containerBlueprint = await blueprintManager.getBlueprint<IItem>("items", inventoryType);

    const bag = new Item({
      ...containerBlueprint,
      owner: character._id,
      carrier: character._id,
      isEquipped: true,
    });
    await bag.save();

    equipment.inventory = bag._id;
    await equipment.save();

    return equipment;
  }

  @TrackNewRelicTransaction()
  public async sendInventoryUpdateEvent(character: ICharacter): Promise<void> {
    const inventory = await this.getInventory(character);
    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as unknown as IItemContainer;

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      {
        inventory: inventoryContainer,
        openInventoryOnUpdate: false,
      }
    );
  }
}
