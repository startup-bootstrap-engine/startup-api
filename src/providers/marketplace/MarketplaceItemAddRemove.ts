import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { MarketplaceItem } from "@entities/ModuleMarketplace/MarketplaceItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterWeight } from "@providers/character/CharacterWeight";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IEquipmentAndInventoryUpdatePayload, IItemContainer, ItemSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { MarketplaceGetItems } from "./MarketplaceGetItems";
import { MarketplaceValidation } from "./MarketplaceValidation";

@provide(MarketplaceItemAddRemove)
export class MarketplaceItemAddRemove {
  constructor(
    private characterItemInventory: CharacterItemInventory,
    private characterInventory: CharacterInventory,
    private characterItemContainer: CharacterItemContainer,
    private socketMessaging: SocketMessaging,
    private marketplaceValidation: MarketplaceValidation,
    private characterWeight: CharacterWeight,
    private marketplaceGetItems: MarketplaceGetItems
  ) {}

  public async addItemToMarketplace(
    character: ICharacter,
    npcId: string,
    marketplaceItem: {
      price: number;
      itemId: string;
    }
  ): Promise<boolean> {
    const marketplaceValid = await this.marketplaceValidation.hasBasicValidation(character, npcId);
    if (!marketplaceValid) {
      return false;
    }

    const item = await Item.findById(marketplaceItem.itemId);
    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `Item with id ${marketplaceItem.itemId} does not exist`
      );
      return false;
    }

    const isItemValid = this.marketplaceValidation.isItemValid(item);
    if (!isItemValid) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "This item cannot be sold");
      return false;
    }

    const itemRemoved = await this.characterItemInventory.deleteItemFromInventory(marketplaceItem.itemId, character);
    if (!itemRemoved) {
      return false;
    }
    await this.characterWeight.updateCharacterWeight(character);
    await this.sendRefreshItemsEvent(character);

    await new MarketplaceItem({
      price: marketplaceItem.price,
      item: item._id,
      owner: character._id,
    }).save();

    await this.marketplaceGetItems.getItems(character, npcId, {
      owner: character._id.toString(),
    });

    return true;
  }

  public async removeItemFromMarketplaceToInventory(
    character: ICharacter,
    npcId: string,
    marketPlaceItemId: string
  ): Promise<boolean> {
    const marketplaceValid = await this.marketplaceValidation.hasBasicValidation(character, npcId);
    if (!marketplaceValid) {
      return false;
    }

    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainerId = inventory?.itemContainer as unknown as string;
    if (!inventoryContainerId) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "You don't have an inventory.");
      return false;
    }

    const marketplaceItem = await MarketplaceItem.findById(marketPlaceItemId);
    if (!marketplaceItem) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `MarketplaceItem with id ${marketPlaceItemId} does not exist`
      );
      return false;
    }

    const isOwner = marketplaceItem.owner?.toString() === character._id.toString();
    if (!isOwner) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "You are not the owner of this item");
      return false;
    }

    const item = (await Item.findById(marketplaceItem.item)) as IItem | null;
    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `Item with id ${marketplaceItem.item} does not exist`
      );
      return false;
    }

    const addedToInventory = await this.characterItemContainer.addItemToContainer(
      item,
      character,
      inventoryContainerId
    );
    if (!addedToInventory) {
      return false;
    }

    await this.characterWeight.updateCharacterWeight(character);
    await marketplaceItem.remove();
    await this.sendRefreshItemsEvent(character);

    await this.marketplaceGetItems.getItems(character, npcId, {
      owner: character._id.toString(),
    });

    return true;
  }

  private async sendRefreshItemsEvent(character: ICharacter): Promise<void> {
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer).cacheQuery({
      cacheKey: `${inventory?.itemContainer}-inventoryContainer`,
    })) as unknown as IItemContainer;

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: true,
    };

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }
}
