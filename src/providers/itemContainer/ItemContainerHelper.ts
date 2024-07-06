import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { IItemContainer, ItemContainerType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { isNumber } from "lodash";

@provide(ItemContainerHelper)
export class ItemContainerHelper {
  constructor(private characterInventory: CharacterInventory) {}

  @TrackNewRelicTransaction()
  public async getContainerType(itemContainer: IItemContainer): Promise<ItemContainerType | undefined> {
    try {
      const item = await Item.findById(itemContainer.parentItem).lean();

      if (!item) {
        console.error("Failed to get item type: item not found");
        return undefined;
      }

      if (item.name.includes("body")) {
        return ItemContainerType.Loot;
      }

      if (isNumber(item.x) && isNumber(item.y) && item.scene) {
        return ItemContainerType.MapContainer;
      }

      const owner = (await Character.findById(item.owner).lean()) as ICharacter;
      if (owner) {
        const inventory = await this.characterInventory.getInventory(owner);

        if (!inventory) {
          console.error("Failed to get item type: inventory not found");
          return undefined;
        }

        if (item._id.equals(inventory._id)) {
          return ItemContainerType.Inventory;
        }
      }

      return ItemContainerType.Loot;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  @TrackNewRelicTransaction()
  public async execFnInAllItemContainerSlots(
    itemContainer: IItemContainer,
    fn: (item: IItem, slotIndex: number) => Promise<void>
  ): Promise<void> {
    const slots = itemContainer.slots;
    if (!slots) return;

    const loopedItems = new Set<string>();

    await Promise.all(
      Object.entries(slots).map(async ([slotIndex, itemData]) => {
        if (!itemData || loopedItems.has(itemData._id)) return;

        loopedItems.add(itemData._id);

        const item = itemData as IItem;
        if (item) {
          await fn(item, Number(slotIndex));
        }
      })
    );
  }

  @TrackNewRelicTransaction()
  public async generateItemContainerIfNotPresentOnItem(item: IItem): Promise<IItemContainer | undefined> {
    if (!item.isItemContainer) return undefined;

    const hasItemContainer = await ItemContainer.exists({ parentItem: item._id });
    if (hasItemContainer) return undefined;

    const slotQty = item.generateContainerSlots ?? 20;
    const slots = Array.from({ length: slotQty }, (_, i) => ({ [i]: null })).reduce(
      (acc, slot) => ({ ...acc, ...slot }),
      {}
    );

    const newContainer = (await ItemContainer.create({
      name: item.name,
      parentItem: item._id,
      slotQty,
      slots,
      owner: item.owner,
      isOwnerRestricted: !!item.owner,
    })) as unknown as IItemContainer;

    await Item.updateOne({ _id: item._id }, { $set: { itemContainer: newContainer._id } });

    return newContainer;
  }
}
