import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { provide } from "inversify-binding-decorators";

@provide(ItemOwnership)
export class ItemOwnership {
  constructor(private characterItemSlot: CharacterItemSlots) {}

  public async addItemOwnership(item: IItem, character: ICharacter): Promise<void> {
    await Item.updateOne({ _id: item._id }, { owner: character._id });

    if (item?.itemContainer) {
      // adds ownership for the container itself
      await ItemContainer.updateOne(
        {
          _id: item.itemContainer,
        },
        { owner: character._id }
      );

      // and for all nested items

      await this.addOwnershipToAllItemsInContainer(
        item.itemContainer as unknown as string,
        character._id as unknown as string
      );
    }
  }

  public async removeItemOwnership(item: IItem): Promise<void> {
    await Item.updateOne(
      {
        _id: item._id,
      },
      {
        owner: undefined,
      }
    );

    if (item?.itemContainer) {
      const itemContainer = await ItemContainer.findById(item.itemContainer);

      if (!itemContainer) {
        throw new Error("ItemOwnership: Item container not found");
      }

      // this remover ownership from the container itself
      await ItemContainer.updateOne(
        {
          _id: item.itemContainer,
        },
        { owner: undefined }
      );

      // this removes from all nested items
      await this.removeOwnershipFromAllItemsInContainer(itemContainer._id as unknown as string);
    }
  }

  public async addOwnershipToAllItemsInContainer(itemContainerId: string, owner: string): Promise<void> {
    const itemContainer = await ItemContainer.findById(itemContainerId);

    if (!itemContainer) {
      throw new Error("ItemOwnership: Item container not found");
    }

    await this.loopThroughAllItemsInContainerAndCallback(itemContainer, async (item, slotIndex) => {
      await Item.updateOne(
        {
          _id: item._id,
        },
        {
          owner,
        }
      );

      await this.characterItemSlot.updateItemOnSlot(slotIndex, itemContainer, {
        owner,
      });
    });
  }

  public async removeOwnershipFromAllItemsInContainer(itemContainerId: string): Promise<void> {
    const itemContainer = await ItemContainer.findById(itemContainerId);

    if (!itemContainer) {
      throw new Error("ItemOwnership: Item container not found");
    }

    await this.loopThroughAllItemsInContainerAndCallback(itemContainer, async (item, slotIndex) => {
      await Item.updateOne(
        {
          _id: item._id,
        },
        {
          $unset: {
            owner: "",
          },
        }
      );

      await this.characterItemSlot.updateItemOnSlot(slotIndex, itemContainer, {
        owner: undefined,
      });
    });
  }

  private async loopThroughAllItemsInContainerAndCallback(
    itemContainer: IItemContainer,
    fn: (item: IItem, slotIndex: number) => Promise<void>
  ): Promise<void> {
    const slots = itemContainer.slots;

    for (const [slotIndex, itemData] of Object.entries(slots)) {
      const item = itemData as IItem;

      if (item) {
        await fn(item, Number(slotIndex));
      }
    }
  }
}
