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
        throw new Error("Failed to get item type: item not found");
      }
      if (item.name.includes("body")) {
        return ItemContainerType.Loot;
      }

      // if we use item.x that will be falsy.
      // because 0 is a "falsy" value in JavaScript.
      // better use isNumber() fn.
      if (isNumber(item.x) && isNumber(item.y) && item.scene) {
        return ItemContainerType.MapContainer;
      }

      const owner = (await Character.findById(item.owner)) as unknown as ICharacter;
      const inventory = await this.characterInventory.getInventory(owner);

      if (item?._id.toString() === inventory?._id.toString()) {
        return ItemContainerType.Inventory;
      }

      return ItemContainerType.Loot; // last resort, lets consider its a loot container
    } catch (error) {
      console.error(error);
    }
  }

  //! This method can potentially cause a recursion. Please use it with careful! Make sure you use a set to avoid infinite loops (check usage)
  @TrackNewRelicTransaction()
  public async execFnInAllItemContainerSlots(
    itemContainer: IItemContainer,
    fn: (item: IItem, slotIndex: number) => Promise<void>
  ): Promise<void> {
    const slots = itemContainer.slots;

    const loopedItems = new Set<string>();

    if (!slots) {
      return;
    }

    for (const [slotIndex, itemData] of Object.entries(slots)) {
      if (loopedItems.has(itemData?._id)) {
        continue;
      }

      loopedItems.add(itemData?._id);

      const item = itemData as IItem;

      if (item) {
        await fn(item, Number(slotIndex));
      }
    }
  }

  @TrackNewRelicTransaction()
  public async generateItemContainerIfNotPresentOnItem(item: IItem): Promise<IItemContainer | undefined> {
    const hasItemContainer = await ItemContainer.exists({ parentItem: item._id });

    if (item.isItemContainer && !hasItemContainer) {
      let slotQty: number = 20;

      if (item.generateContainerSlots) {
        slotQty = item.generateContainerSlots;
      }

      // generate slots object
      const slots = {};

      for (let i = 0; i < slotQty; i++) {
        slots[Number(i)] = null;
      }

      const newContainer = (await ItemContainer.create({
        name: item.name,
        parentItem: item._id,
        slotQty,
        slots,
        owner: item.owner,
        isOwnerRestricted: !!item.owner,
      })) as unknown as IItemContainer;

      // Update the item to include the new container reference
      await Item.updateOne({ _id: item._id }, { $set: { itemContainer: newContainer._id } });

      return newContainer;
    }
  }
}
