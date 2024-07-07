import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provide } from "inversify-binding-decorators";

@provide(ItemContainerCleaner)
export class ItemContainerCleaner {
  @TrackNewRelicTransaction()
  public async cleanupMissingReferences(): Promise<void> {
    await this.cleanupItemContainersWithMissingParentItems();
    await this.cleanupItemsWithMissingItemContainers();
  }

  private async cleanupItemContainersWithMissingParentItems(): Promise<void> {
    // eslint-disable-next-line mongoose-lean/require-lean
    const itemContainers = await ItemContainer.find({});

    const itemContainerIds: string[] = [];

    for (const itemContainer of itemContainers) {
      const parentItem = await Item.exists({ _id: itemContainer.parentItem });

      if (!parentItem) {
        itemContainerIds.push(itemContainer._id);
      }
    }

    if (itemContainerIds.length > 0) {
      await ItemContainer.deleteMany({ _id: { $in: itemContainerIds } });
    }
  }

  private async cleanupItemsWithMissingItemContainers(): Promise<void> {}
}
