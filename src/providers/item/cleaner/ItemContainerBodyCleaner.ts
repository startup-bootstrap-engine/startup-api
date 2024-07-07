import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { EntityType, ItemSubType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(ItemContainerBodyCleaner)
export class ItemContainerBodyCleaner {
  @TrackNewRelicTransaction()
  public async cleanupBodies(): Promise<void> {
    try {
      const bodyItems = await this.findBodiesToBeDeleted();

      const itemContainerIds: string[] = [];
      const itemIds: string[] = [];

      // Create an array of promises to be resolved
      const charBodyRemovals = bodyItems.map(async (charBodyItem) => {
        // eslint-disable-next-line mongoose-lean/require-lean
        const itemContainer = await ItemContainer.findOne({ _id: charBodyItem.itemContainer });

        if (itemContainer) {
          itemContainerIds.push(itemContainer._id);
          const nestedItemIds = itemContainer?.itemIds || [];
          itemIds.push(...nestedItemIds);
        }

        return charBodyItem.remove();
      });

      // Resolve promises in parallel
      await Promise.all(charBodyRemovals);

      // Delete items and item containers in batches
      await this.deleteBatchItems(itemIds);
      await this.deleteBatchItemContainers(itemContainerIds);
    } catch (error) {
      console.error(error);
    }
  }

  private async findBodiesToBeDeleted(): Promise<IItem[]> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    // eslint-disable-next-line mongoose-lean/require-lean
    const npcBodies = await Item.find({
      createdAt: { $lt: fiveMinutesAgo },
      subType: ItemSubType.DeadBody,
      $or: [{ deadBodyEntityType: EntityType.NPC }, { deadBodyEntityType: { $exists: false } }],
    });

    // eslint-disable-next-line mongoose-lean/require-lean
    const characterBodies = await Item.find({
      createdAt: { $lt: oneHourAgo },
      subType: ItemSubType.DeadBody,
      deadBodyEntityType: EntityType.Character,
    });

    return [...npcBodies, ...characterBodies];
  }

  private async deleteBatchItems(itemIds: string[]): Promise<void> {
    if (itemIds.length > 0) {
      await Item.deleteMany({ _id: { $in: itemIds } });
    }
  }

  private async deleteBatchItemContainers(itemContainerIds: string[]): Promise<void> {
    if (itemContainerIds.length > 0) {
      await ItemContainer.deleteMany({ _id: { $in: itemContainerIds } });
    }
  }
}
