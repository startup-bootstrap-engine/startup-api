import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { ItemContainerHelper } from "@providers/itemContainer/ItemContainerHelper";
import { Locker } from "@providers/locks/Locker";
import { provide } from "inversify-binding-decorators";

@provide(ItemOwnership)
export class ItemOwnership {
  constructor(
    private characterItemSlot: CharacterItemSlots,
    private itemContainerHelper: ItemContainerHelper,
    private locker: Locker
  ) {}

  @TrackNewRelicTransaction()
  public async addItemOwnership(item: IItem, character: ICharacter): Promise<boolean> {
    const lockKey = `item-ownership-add-${item._id}`;
    const canProceed = await this.locker.lock(lockKey);

    if (!canProceed) {
      console.error(`Unable to acquire lock for item: ${item._id}`);
      return false;
    }

    try {
      const isAlreadyOwnedByCharacter = await this.isAlreadyOwnedByCharacter(item, character);
      if (isAlreadyOwnedByCharacter) {
        return false;
      }

      const updatePromises: any[] = [
        this.retryOperation(() => Item.updateOne({ _id: item._id }, { owner: character._id }).exec()),
      ];

      if (item?.itemContainer) {
        updatePromises.push(
          this.retryOperation(() =>
            ItemContainer.updateOne({ _id: item.itemContainer }, { owner: character._id }).exec()
          ),
          this.retryOperation(() =>
            this.addOwnershipToAllItemsInContainer(
              item.itemContainer as unknown as string,
              character._id as unknown as string
            )
          )
        );
      }

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error("Error in addItemOwnership:", error);
      return false; // Ensure the method returns false on error
    } finally {
      await this.locker.unlock(lockKey);
    }
  }

  @TrackNewRelicTransaction()
  public async removeItemOwnership(item: IItem): Promise<boolean> {
    const lockKey = `item-ownership-remove-${item._id}`;
    const canProceed = await this.locker.lock(lockKey);

    if (!canProceed) {
      console.error(`Unable to acquire lock for item: ${item._id}`);
      return false;
    }

    try {
      const updatePromises: any[] = [
        this.retryOperation(() => Item.updateOne({ _id: item._id }, { $unset: { owner: "" } }).exec()),
      ];

      if (item?.itemContainer) {
        const itemContainer = await this.retryOperation(() =>
          ItemContainer.findById(item.itemContainer).lean<IItemContainer>().exec()
        );
        if (!itemContainer) {
          throw new Error("ItemOwnership: Item container not found");
        }

        updatePromises.push(
          this.retryOperation(() =>
            ItemContainer.updateOne({ _id: item.itemContainer }, { $unset: { owner: "" } }).exec()
          ),
          this.retryOperation(() =>
            this.removeOwnershipFromAllItemsInContainer(itemContainer as unknown as IItemContainer)
          )
        );
      }

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error("Error in removeItemOwnership:", error);
      return false;
    } finally {
      await this.locker.unlock(lockKey);
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

    const itemContainer = await this.retryOperation(() =>
      ItemContainer.findById(itemContainerId).lean<IItemContainer>().exec()
    );
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
        await this.retryOperation(() =>
          this.characterItemSlot.updateItemOnSlot(slotIndex, itemContainer as any, { owner })
        );
      }
    });
  }

  @TrackNewRelicTransaction()
  private async removeOwnershipFromAllItemsInContainer(
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

      await this.retryOperation(() =>
        this.characterItemSlot.updateItemOnSlot(slotIndex, itemContainer, { owner: undefined })
      );
    });
  }

  private async isAlreadyOwnedByCharacter(item: IItem, character: ICharacter): Promise<boolean> {
    const characterId = character._id.toString();

    // Determine owner ID correctly
    const ownerId = (item.owner as ICharacter)?._id?.toString() || item.owner?.toString();

    if (item.itemContainer) {
      const itemContainer = await ItemContainer.findById(item.itemContainer).lean();
      if (itemContainer && itemContainer.owner?.toString() === characterId) {
        return true;
      }
    }

    return ownerId === characterId;
  }

  private async retryOperation<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) {
          console.error("Operation failed after retries:", error);
          throw error;
        }
        await new Promise<void>((resolve) => setTimeout(resolve, Math.pow(2, i) * 100)); // exponential backoff
      }
    }

    throw new Error("Unreachable code");
  }
}
