import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment } from "@entities/ModuleCharacter/EquipmentModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { EquipmentSlots } from "@providers/equipment/EquipmentSlots";

import { MarketplaceItem } from "@entities/ModuleMarketplace/MarketplaceItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { provide } from "inversify-binding-decorators";
import { ItemOwnership } from "../ItemOwnership";

@provide(ItemMissingReferenceCleaner)
export class ItemMissingReferenceCleaner {
  constructor(
    private characterInventory: CharacterInventory,
    private equipmentSlots: EquipmentSlots,
    private itemOwnership: ItemOwnership,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  @TrackNewRelicTransaction()
  public async clearMissingReferences(character: ICharacter): Promise<void> {
    await this.cleanupMissingEquipmentReferences(character);
    await this.cleanupMissingInventoryReferences(character);
  }

  @TrackNewRelicTransaction()
  public async cleanupItemsWithoutOwnership(): Promise<void> {
    try {
      console.log("Starting cleanup of items without owner...");

      const items = await Item.find({ owner: { $exists: false }, carrier: { $exists: false } }).lean();

      const itemsIdsToDelete: string[] = [];
      const itemContainersIdsToDelete: string[] = [];
      const marketplaceItemsIdsToDelete: string[] = [];

      for (const item of items) {
        if (item.isEquipped || item.isInDepot || item.carrier || item.isPersistent) {
          continue;
        }

        itemsIdsToDelete.push(item._id);

        if (item.itemContainer) {
          itemContainersIdsToDelete.push(item.itemContainer.toString());
        }

        marketplaceItemsIdsToDelete.push(item._id);
      }
      const promises = [
        Item.deleteMany({ _id: { $in: itemsIdsToDelete } }),
        ItemContainer.deleteMany({ _id: { $in: itemContainersIdsToDelete } }),
        MarketplaceItem.deleteMany({ _id: { $in: marketplaceItemsIdsToDelete } }),
      ];

      const [itemDeletionCount, itemContainerDeletionCount, marketplaceItemDeletionCount] = await Promise.all(promises);

      console.log(
        `Deleted ${itemDeletionCount.deletedCount} items, ${itemContainerDeletionCount.deletedCount} item containers and ${marketplaceItemDeletionCount.deletedCount} marketplace items without owner`
      );
    } catch (error) {
      console.error(error);
    }
  }

  @TrackNewRelicTransaction()
  private async cleanupMissingEquipmentReferences(character: ICharacter): Promise<void> {
    await this.inMemoryHashTable.delete("equipment-slots", character._id);

    if (!character.equipment) {
      return;
    }

    const slotsData = await this.equipmentSlots.getEquipmentSlots(character._id, character.equipment.toString());

    for (const [slotName, itemData] of Object.entries(slotsData)) {
      if (!itemData || slotName === "_id") {
        continue;
      }

      const item = (await Item.findById(itemData._id).lean({ virtuals: true, defaults: true })) as IItem;

      if (item && !item?.owner) {
        await this.itemOwnership.addItemOwnership(item, character);
      }

      if (!item) {
        console.error(`Cleaning equipment reference for ${character._id} in slot ${slotName}. 
          Related info:
          - Equipment: ${character.equipment}
          - Item: ${itemData._id}
          - Item data: ${JSON.stringify(itemData)}
          - Slots data: ${JSON.stringify(slotsData)}
          - Character: ${JSON.stringify(character)}
          `);

        await Equipment.updateOne(
          { _id: character.equipment.toString() },
          {
            $unset: {
              [slotName]: "",
            },
          }
        );
      }
    }
  }

  @TrackNewRelicTransaction()
  private async cleanupMissingInventoryReferences(character: ICharacter): Promise<void> {
    const inventory = await this.characterInventory.getInventory(character);

    if (!inventory) {
      return;
    }

    const inventoryContainer = await ItemContainer.findById(inventory?.itemContainer).lean({
      virtuals: true,
      defaults: true,
    });

    if (!inventoryContainer) {
      return;
    }

    const slots = inventoryContainer.slots as Record<string, IItem>;

    for (const slotNumber of Object.keys(slots)) {
      const slotData = slots[slotNumber];
      if (!slotData) {
        continue;
      }
      // check if item exists
      const item = (await Item.findById(slotData._id).lean({ virtuals: true, defaults: true })) as IItem;

      if (item && !item?.owner) {
        await this.itemOwnership.addItemOwnership(item, character);
      }

      if (!item) {
        // remove slot on item container with update one
        delete slots[slotNumber];
      }
    }

    await ItemContainer.updateOne({ _id: inventoryContainer._id }, { slots });
  }
}
