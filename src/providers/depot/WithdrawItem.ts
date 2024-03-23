import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
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
    private characterWeight: CharacterWeightQueue,
    private itemUpdater: ItemUpdater,
    private inMemoryHashTable: InMemoryHashTable,
    private itemContainerTransactionQueue: ItemContainerTransactionQueue,
    private socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public async withdraw(character: ICharacter, data: IDepotContainerWithdraw): Promise<IItemContainer | undefined> {
    try {
      const { npcId, itemId, toContainerId } = data;
      const originContainer = (await this.openDepot.getContainer(character.id, npcId)) as unknown as IItemContainer;
      if (!originContainer) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, origin container not found.");
        throw new Error(`DepotSystem > Item container not found for character id ${character.id} and npc id ${npcId}`);
      }

      // check if destination container exists
      const targetContainer = (await ItemContainer.findById(toContainerId)) as unknown as IItemContainer;

      if (!targetContainer) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, target container not found.");
        throw new Error(`DepotSystem > Target container not found: ${toContainerId}`);
      }

      // check if item exists
      const item = await Item.findById(itemId);

      if (!item) {
        // prevent depot slot from getting stuck
        await this.characterItemSlots.deleteItemOnSlot(originContainer as any, itemId);
        throw new Error(`DepotSystem > Item not found: ${itemId}`);
      }

      await this.itemContainerTransactionQueue.transferToContainer(item, character, originContainer, targetContainer, {
        readContainersAfterTransaction: [
          { itemContainerId: originContainer._id.toString(), type: ItemContainerType.Depot },
          { itemContainerId: targetContainer._id.toString(), type: ItemContainerType.Inventory },
        ],
        executeFnAfterTransaction: async () => {
          await this.markNotIsInDepot(item);
        },
      });

      return originContainer as unknown as IItemContainer;
    } catch (error) {
      console.error(error);
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
