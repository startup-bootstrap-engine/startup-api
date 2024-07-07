import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemMove } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(ItemDragAndDropValidator)
export class ItemDragAndDropValidator {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private characterItemSlots: CharacterItemSlots,
    private characterInventory: CharacterInventory
  ) {}

  public async isItemMoveValid(itemMove: IItemMove, character: ICharacter, itemMoveData: IItemMove): Promise<Boolean> {
    const itemFrom = await Item.findById(itemMove.from.item._id).lean<IItem>();
    const itemTo = await Item.findById(itemMove.to.item?._id).lean<IItem>();

    if (itemFrom?.rarity !== itemTo?.rarity && itemTo !== null) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Unable to move items with different rarities.");
      return false;
    }

    if (!itemFrom) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, item to be moved wasn't found.");
      return false;
    }

    if (
      itemFrom?.owner?.toString() !== character._id.toString() ||
      (itemTo && itemTo.owner?.toString() !== character._id.toString())
    ) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you don't own this item.");
      return false;
    }

    if (itemMove.quantity && itemFrom.stackQty && itemMove.quantity > itemFrom.stackQty) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you can't move more than the available quantity."
      );
      return false;
    }

    if (itemMove.quantity && itemMove.quantity < 0) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can't move negative quantities.");
      return false;
    }

    if (itemMoveData.quantity !== undefined) {
      const sourceContainer = await ItemContainer.findById(itemMoveData.from.containerId).lean();
      const sourceItem = sourceContainer?.slots[itemMoveData.from.slotIndex];
      if (!sourceItem || sourceItem.stackQty < itemMoveData.quantity) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Invalid item quantity.");
        return false;
      }
    }

    if (itemMove.from.slotIndex === itemMove?.to?.slotIndex) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can't move an item to the same slot.");
      return false;
    }

    if (itemTo?.isItemContainer) {
      const hasAvailableSlots = await this.characterItemSlots.hasAvailableSlot(
        itemTo.itemContainer as string,
        itemFrom
      );

      if (!hasAvailableSlots) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, there's no space in this container.");
        return false;
      }
    }

    const isInventory = itemMove.from.source === "Inventory" && itemMove.to.source === "Inventory";
    if (!itemFrom || (!itemTo && itemMove.to.item !== null) || !isInventory) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, this item is not accessible.");
      return false;
    }

    const inventory = await this.characterInventory.getInventory(character);
    if (!inventory) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must have a bag or backpack to move this item."
      );
      return false;
    }

    // eslint-disable-next-line mongoose-lean/require-lean
    const inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as IItemContainer;
    if (!inventoryContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, inventory container not found.");
      return false;
    }

    const hasItemToMoveInInventory = inventoryContainer?.itemIds?.find(
      (itemId) => String(itemId) === String(itemFrom._id)
    );
    const hasItemToMoveToInInventory =
      itemTo === null || inventoryContainer?.itemIds?.find((itemId) => String(itemId) === String(itemTo._id));

    if (!hasItemToMoveInInventory || !hasItemToMoveToInInventory) {
      return false;
    }

    if (
      itemMove.from.containerId.toString() !== inventoryContainer?._id.toString() ||
      itemMove.to.containerId.toString() !== inventoryContainer?._id.toString()
    ) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, this item does not belong to your inventory."
      );
      return false;
    }

    const toSlotItem = inventoryContainer.slots[itemMove.to.slotIndex];

    if (toSlotItem && toSlotItem.key !== itemMove.from.item.key) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you cannot move items of different types.");
      return false;
    }

    if (!inventoryContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must have a bag or backpack to move this item."
      );
      return false;
    }

    return this.characterValidation.hasBasicValidation(character);
  }
}
