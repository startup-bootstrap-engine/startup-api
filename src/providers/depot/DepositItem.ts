import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Depot } from "@entities/ModuleDepot/DepotModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { CharacterWeight } from "@providers/character/weight/CharacterWeight";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { ItemOwnership } from "@providers/item/ItemOwnership";
import { ItemUpdater } from "@providers/item/ItemUpdater";
import { ItemView } from "@providers/item/ItemView";
import { MapHelper } from "@providers/map/MapHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IDepotDepositItem, IEquipmentAndInventoryUpdatePayload } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { DepotSystem } from "./DepotSystem";
import { OpenDepot } from "./OpenDepot";

@provide(DepositItem)
export class DepositItem {
  constructor(
    private openDepot: OpenDepot,
    private itemView: ItemView,
    private characterWeight: CharacterWeight,
    private depotSystem: DepotSystem,
    private mapHelper: MapHelper,
    private socketMessaging: SocketMessaging,
    private itemOwnership: ItemOwnership,
    private itemUpdater: ItemUpdater,
    private characterItemSlots: CharacterItemSlots,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  @TrackNewRelicTransaction()
  public async deposit(character: ICharacter, data: IDepotDepositItem): Promise<IItemContainer | undefined> {
    const { itemId, npcId, fromContainerId } = data;

    // Simultaneously retrieve necessary data to reduce wait times.
    const [itemContainer, item, npc] = await Promise.all([
      this.openDepot.getContainer(character.id, npcId),
      Item.findById(itemId) as unknown as IItem,
      NPC.findById(npcId).lean(),
    ]);

    if (!itemContainer) {
      throw new Error(`DepotSystem > Item container not found for character id ${character.id} and npc id ${npcId}`);
    }
    if (!item) {
      throw new Error(`DepotSystem > Item not found: ${itemId}`);
    }
    if (!npc) {
      throw new Error(`DepotSystem > NPC not found: ${npcId}`);
    }

    const isDepositValid = await this.isDepositValid(character, data);
    if (!isDepositValid) return;

    // Update item key and save only if necessary.
    if (item.key !== item.baseKey) {
      item.key = item.baseKey;
      await item.save();
    }

    const wasItemAddedToContainer = await this.depotSystem.addItemToContainer(
      character,
      item,
      itemContainer as unknown as IItemContainer
    );
    if (!wasItemAddedToContainer) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Failed to deposit item. Please try again.");
      return;
    }

    if (fromContainerId) {
      await this.handleItemRemovalFromContainer(fromContainerId, item, character);
    }

    // Separate handling for map items to keep the deposit logic clean and focused.
    if (this.isItemFromMap(item)) {
      await this.removeFromMapContainer(item);
    }

    return itemContainer as unknown as IItemContainer;
  }

  private async handleItemRemovalFromContainer(
    fromContainerId: string,
    item: IItem,
    character: ICharacter
  ): Promise<void> {
    const promises = [
      this.depotSystem.removeFromContainer(fromContainerId, item),
      this.inMemoryHashTable.delete("container-all-items", fromContainerId),
      item.owner ? Promise.resolve() : this.itemOwnership.addItemOwnership(item, character),
      this.markItemAsInDepot(item),
      this.characterWeight.updateCharacterWeight(character),
    ];

    const [container] = await Promise.all(promises);

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = { inventory: container as any };
    this.depotSystem.updateInventoryCharacter(payloadUpdate, character);
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

  private async isDepositValid(character: ICharacter, data: IDepotDepositItem): Promise<boolean> {
    // check if there're slots available on the depot

    const depot = await Depot.findOne({ owner: character._id }).lean();

    if (!depot) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, this depot is not available.");
      return false;
    }

    const itemToBeAdded = await Item.findById(data.itemId).lean();

    const hasAvailableSlot = await this.characterItemSlots.hasAvailableSlot(
      depot?.itemContainer as string,
      itemToBeAdded as IItem,
      true
    );

    if (!hasAvailableSlot) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, your depot is full. Remove some items and try again."
      );
      return false;
    }

    return true;
  }

  private async removeFromMapContainer(item: IItem): Promise<void> {
    // If an item has a x, y and scene, it means its coming from a map pickup. So we should destroy its representation and warn other characters nearby.
    const itemRemovedFromMap = await this.itemView.removeItemFromMap(item);
    if (!itemRemovedFromMap) {
      throw new Error(`DepotSystem > Error removing item with id ${item.id} from map`);
    }
  }
}
