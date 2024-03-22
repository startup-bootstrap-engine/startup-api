import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { EquipmentSlots } from "@providers/equipment/EquipmentSlots";
import { ItemContainerHelper } from "@providers/itemContainer/ItemContainerHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  IItemContainerRead,
  ItemSocketEvents,
  ItemType,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { ItemDropVerifier } from "../ItemDropVerifier";

@provide(ItemPickupUpdater)
export class ItemPickupUpdater {
  constructor(
    private characterWeight: CharacterWeightQueue,
    private equipmentSlots: EquipmentSlots,
    private socketMessaging: SocketMessaging,
    private itemContainerHelper: ItemContainerHelper,
    private inMemoryHashTable: InMemoryHashTable,
    private itemDropVerifier: ItemDropVerifier
  ) {}

  @TrackNewRelicTransaction()
  public async finalizePickup(item: IItem, character: ICharacter): Promise<void> {
    await Promise.all([
      clearCacheForKey(`${character._id}-inventory`),
      this.inMemoryHashTable.delete("container-all-items", item.itemContainer as string),
      this.inMemoryHashTable.delete("inventory-weight", character._id),
      this.inMemoryHashTable.delete("character-max-weights", character._id),
      this.itemDropVerifier.deleteItemFromCharacterFromDrop(character, item._id),
    ]);

    await this.characterWeight.updateCharacterWeight(character);
  }

  @TrackNewRelicTransaction()
  public async refreshEquipmentIfInventoryItem(character: ICharacter): Promise<void> {
    const equipmentSlots = await this.equipmentSlots.getEquipmentSlots(
      character._id,
      character.equipment as unknown as string
    );

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      equipment: equipmentSlots,
    };

    this.updateInventoryCharacter(payloadUpdate, character);
  }

  public updateInventoryCharacter(payloadUpdate: IEquipmentAndInventoryUpdatePayload, character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }

  @TrackNewRelicTransaction()
  public async sendContainerRead(itemContainer: IItemContainer, character: ICharacter): Promise<void> {
    if (character && itemContainer) {
      const type = await this.itemContainerHelper.getContainerType(itemContainer);

      if (!type) {
        this.socketMessaging.sendErrorMessageToCharacter(character);
        return;
      }

      this.socketMessaging.sendEventToUser<IItemContainerRead>(character.channelId!, ItemSocketEvents.ContainerRead, {
        // @ts-ignore
        itemContainer,
        type,
      });
    }
  }

  public getAllowedItemTypes(): ItemType[] {
    const allowedItemTypes: ItemType[] = [];

    for (const allowedItemType of Object.keys(ItemType)) {
      allowedItemTypes.push(ItemType[allowedItemType]);
    }

    return allowedItemTypes;
  }
}
