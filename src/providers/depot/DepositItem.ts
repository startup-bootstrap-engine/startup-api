import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { ItemUpdater } from "@providers/item/ItemUpdater";
import { ItemView } from "@providers/item/ItemView";
import { ItemContainerTransactionQueue } from "@providers/itemContainer/ItemContainerTransactionQueue";
import { MapHelper } from "@providers/map/MapHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IDepotDepositItem, ItemContainerType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { OpenDepot } from "./OpenDepot";

@provide(DepositItem)
export class DepositItem {
  constructor(
    private openDepot: OpenDepot,
    private itemView: ItemView,
    private mapHelper: MapHelper,
    private socketMessaging: SocketMessaging,
    private itemUpdater: ItemUpdater,
    private itemContainerTransactionQueue: ItemContainerTransactionQueue
  ) {}

  @TrackNewRelicTransaction()
  public async deposit(character: ICharacter, data: IDepotDepositItem): Promise<boolean> {
    const { itemId, npcId, fromContainerId } = data;

    try {
      // Fetch origin container first
      const originContainer = await this.getOriginContainer(fromContainerId!);
      if (!originContainer) {
        console.error(`Origin container not found: ${fromContainerId}`);
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, origin container not found.");
        return false;
      }

      // Fetch target container
      const targetContainer = await this.openDepot.getContainer(character.id, npcId);
      if (!targetContainer) {
        console.error(`Target container not found: ${npcId}`);
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, target container not found.");
        return false;
      }

      // Fetch item
      const item = await this.getItem(character, itemId);
      if (!item) {
        // Error message is sent in getItem method
        return false;
      }

      // Fetch NPC
      const npc = await this.getNPC(character, npcId);
      if (!npc) {
        // Error message is sent in getNPC method
        return false;
      }

      const result = await this.transferItemToContainer(
        item,
        character,
        originContainer,
        targetContainer as unknown as IItemContainer
      );

      if (result) {
        await this.handleItemInDepot(item);
      }

      return result;
    } catch (error) {
      console.error(`Error in deposit method for character ${character.id}, item ${itemId}:`, error);
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "An error occurred while processing your deposit. Please try again."
      );
      return false;
    }
  }

  private async getOriginContainer(fromContainerId: string): Promise<IItemContainer | null> {
    const container = await ItemContainer.findById(fromContainerId).lean();
    if (!container) {
      console.error(`Deposit failed: Origin container not found: ${fromContainerId}`);
      return null;
    }
    return container as unknown as IItemContainer;
  }

  private async getItem(character: ICharacter, itemId: string): Promise<IItem | null> {
    const item = await Item.findById(itemId).lean();
    if (!item) {
      console.error(`Deposit failed: Item not found: ${itemId} for character ${character.id}`);
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, item not found.");
      return null;
    }
    return item as unknown as IItem;
  }

  private async getNPC(character: ICharacter, npcId: string): Promise<INPC | null> {
    const npc = await NPC.findById(npcId).lean();
    if (!npc) {
      console.error(`NPC not found: ${npcId}`);
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, NPC not found.");
      return null;
    }
    return npc as INPC;
  }

  private async transferItemToContainer(
    item: IItem,
    character: ICharacter,
    originContainer: IItemContainer,
    targetContainer: IItemContainer
  ): Promise<boolean> {
    return await this.itemContainerTransactionQueue.transferToContainer(
      item,
      character,
      originContainer,
      targetContainer,
      {
        readContainersAfterTransaction: [
          { itemContainerId: targetContainer._id.toString(), type: ItemContainerType.Depot },
          { itemContainerId: originContainer._id.toString(), type: ItemContainerType.Inventory },
        ],
      }
    );
  }

  private async handleItemInDepot(item: IItem): Promise<void> {
    await this.markItemAsInDepot(item);

    if (this.isItemFromMap(item)) {
      await this.removeFromMapContainer(item);
    }
  }

  private isItemFromMap(item: IItem): boolean {
    return this.mapHelper.isCoordinateValid(item.x) && this.mapHelper.isCoordinateValid(item.y) && !!item.scene;
  }

  private async markItemAsInDepot(item: IItem): Promise<void> {
    await this.itemUpdater.updateItemRecursivelyIfNeeded(item, {
      $set: {
        isInDepot: true,
      },
    });
  }

  private async removeFromMapContainer(item: IItem): Promise<void> {
    // If an item has a x, y and scene, it means its coming from a map pickup. So we should destroy its representation and warn other characters nearby.
    const itemRemovedFromMap = await this.itemView.removeItemFromMap(item);
    if (!itemRemovedFromMap) {
      throw new Error(`DepotSystem > Error removing item with id ${item._id} from map`);
    }
  }
}
