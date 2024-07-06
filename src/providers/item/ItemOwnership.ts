import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { ItemContainerHelper } from "@providers/itemContainer/ItemContainerHelper";
import { provide } from "inversify-binding-decorators";

@provide(ItemOwnership)
export class ItemOwnership {
  constructor(private characterItemSlot: CharacterItemSlots, private itemContainerHelper: ItemContainerHelper) {}

  @TrackNewRelicTransaction()
  public async addItemOwnership(item: IItem, character: ICharacter): Promise<boolean> {
    try {
      if (item.owner?.toString() === character._id.toString()) {
        return false;
      }

      const updatePromises: any[] = [Item.updateOne({ _id: item._id }, { owner: character._id })];

      if (item?.itemContainer) {
        updatePromises.push(
          ItemContainer.updateOne({ _id: item.itemContainer }, { owner: character._id }),
          this.addOwnershipToAllItemsInContainer(
            item.itemContainer as unknown as string,
            character._id as unknown as string
          )
        );
      }

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error("Error in addItemOwnership:", error);
      return false;
    }
  }

  @TrackNewRelicTransaction()
  public async removeItemOwnership(item: IItem): Promise<boolean> {
    try {
      const updatePromises: any[] = [Item.updateOne({ _id: item._id }, { $unset: { owner: "" } })];

      if (item?.itemContainer) {
        const itemContainer = await ItemContainer.findById(item.itemContainer).lean<IItemContainer>();
        if (!itemContainer) {
          throw new Error("ItemOwnership: Item container not found");
        }

        updatePromises.push(
          ItemContainer.updateOne({ _id: item.itemContainer }, { $unset: { owner: "" } }),
          this.removeOwnershipFromAllItemsInContainer(itemContainer as unknown as IItemContainer)
        );
      }

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error("Error in removeItemOwnership:", error);
      return false;
    }
  }

  @TrackNewRelicTransaction()
  public async addOwnershipToAllItemsInContainer(
    itemContainerId: string,
    owner: string,
    visited = new Set<string>()
  ): Promise<void> {
    if (visited.has(itemContainerId)) {
      return;
    }
    visited.add(itemContainerId);

    const itemContainer = await ItemContainer.findById(itemContainerId).lean<IItemContainer>();
    if (!itemContainer) {
      throw new Error("ItemOwnership: Item container not found");
    }

    const processedItems = new Set<string>();

    await this.itemContainerHelper.execFnInAllItemContainerSlots(itemContainer as any, async (item, slotIndex) => {
      if (processedItems.has(item._id.toString())) {
        return;
      }
      processedItems.add(item._id.toString());

      const success = await this.addItemOwnership(item, { _id: owner } as unknown as ICharacter);
      if (success) {
        await this.characterItemSlot.updateItemOnSlot(slotIndex, itemContainer as any, { owner });
      }
    });
  }

  @TrackNewRelicTransaction()
  public async removeOwnershipFromAllItemsInContainer(
    itemContainer: IItemContainer,
    visited = new Set<string>()
  ): Promise<void> {
    const containerId = itemContainer._id.toString();
    if (visited.has(containerId)) {
      return;
    }
    visited.add(containerId);

    const processedItems = new Set<string>();

    await this.itemContainerHelper.execFnInAllItemContainerSlots(itemContainer as any, async (item, slotIndex) => {
      if (processedItems.has(item._id.toString())) {
        return;
      }
      processedItems.add(item._id.toString());

      await this.characterItemSlot.updateItemOnSlot(slotIndex, itemContainer, { owner: undefined });
    });
  }
}
