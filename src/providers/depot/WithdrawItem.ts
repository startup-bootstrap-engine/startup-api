import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { ItemUpdater } from "@providers/item/ItemUpdater";
import { ItemContainerTransactionQueue } from "@providers/itemContainer/ItemContainerTransactionQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IDepotContainerWithdraw, ItemContainerType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { OpenDepot } from "./OpenDepot";

@provide(WithdrawItem)
export class WithdrawItem {
  constructor(
    private openDepot: OpenDepot,
    private characterItemSlots: CharacterItemSlots,
    private itemUpdater: ItemUpdater,
    private itemContainerTransactionQueue: ItemContainerTransactionQueue,
    private socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public async withdraw(character: ICharacter, data: IDepotContainerWithdraw): Promise<boolean> {
    try {
      const { npcId, itemId, toContainerId } = data;

      const originContainer = (await this.openDepot.getContainer(character.id, npcId)) as unknown as IItemContainer;

      const targetContainer = (await ItemContainer.findById(toContainerId).lean()) as unknown as IItemContainer;

      const item = await Item.findById(itemId).lean<IItem>({ virtuals: true, defaults: true });

      if (!item) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, item not found.");
        // prevent depot slot from getting stuck
        await this.characterItemSlots.deleteItemOnSlot(originContainer as any, itemId);
        throw new Error(`DepotSystem > Item not found: ${itemId}`);
      }

      const result = await this.itemContainerTransactionQueue.transferToContainer(
        item,
        character,
        originContainer,
        targetContainer,
        {
          readContainersAfterTransaction: [
            { itemContainerId: originContainer._id.toString(), type: ItemContainerType.Depot },
            { itemContainerId: targetContainer._id.toString(), type: ItemContainerType.Inventory },
          ],
        }
      );

      if (result) {
        await this.markNotIsInDepot(item);
      }

      return result;
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  private async markNotIsInDepot(item: IItem): Promise<void> {
    await this.itemUpdater.updateItemRecursivelyIfNeeded(item._id, {
      $unset: {
        isInDepot: "",
      },
    });
  }
}
