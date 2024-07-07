/* eslint-disable mongoose-lean/require-lean */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemDrop } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(ItemDropValidator)
export class ItemDropValidator {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private characterInventory: CharacterInventory
  ) {}

  public async isItemDropValid(itemDrop: IItemDrop, character: ICharacter): Promise<Boolean> {
    const item = await Item.findById(itemDrop.itemId);
    const isFromEquipmentSet = itemDrop.source === "equipment";

    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, this item is not accessible.");
      return false;
    }

    if (!isFromEquipmentSet) {
      const validation = await this.validateItemDropFromInventory(itemDrop, character);

      if (!validation) {
        return false;
      }
    }

    return this.characterValidation.hasBasicValidation(character);
  }

  public async validateItemDropFromInventory(
    itemDrop: IItemDrop,

    character: ICharacter
  ): Promise<boolean> {
    const inventory = await this.characterInventory.getInventory(character);

    if (!inventory) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must have a bag or backpack to drop this item."
      );
      return false;
    }

    const inventoryContainer = await ItemContainer.findById(inventory.itemContainer);

    if (!inventoryContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, inventory container not found.");
      return false;
    }

    const hasItemInInventory = inventoryContainer?.itemIds?.find(
      (itemId) => String(itemId) === String(itemDrop.itemId)
    );

    if (!hasItemInInventory) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you do not have this item in your inventory."
      );
      return false;
    }

    if (itemDrop.fromContainerId.toString() !== inventoryContainer?.id.toString()) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, this item does not belong to your inventory."
      );
      return false;
    }

    if (!inventoryContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you must have a bag or backpack to drop this item."
      );
      return false;
    }

    return true;
  }
}
