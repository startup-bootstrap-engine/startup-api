import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { CharacterBuffTracker } from "@providers/character/characterBuff/CharacterBuffTracker";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { CharacterItems } from "@providers/character/characterItems/CharacterItems";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { ItemOwnership } from "@providers/item/ItemOwnership";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ItemSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { EquipmentSlots } from "./EquipmentSlots";

@provide(EquipmentUnequip)
export class EquipmentUnequip {
  constructor(
    private equipmentSlots: EquipmentSlots,
    private characterValidation: CharacterValidation,
    private socketMessaging: SocketMessaging,
    private characterItems: CharacterItems,
    private characterItemSlots: CharacterItemSlots,
    private characterItemContainer: CharacterItemContainer,
    private inMemoryHashTable: InMemoryHashTable,
    private itemOwnership: ItemOwnership,
    private characterBuffTracker: CharacterBuffTracker,
    private characterBuffActivator: CharacterBuffActivator,
    private dynamicQueue: DynamicQueue,
    private resultsPoller: ResultsPoller
  ) {}

  @TrackNewRelicTransaction()
  public async unequip(character: ICharacter, inventory: IItem, item: IItem): Promise<boolean> {
    try {
      if (!this.validateInputs(character, inventory, item)) {
        return false;
      }

      const inventoryContainerId = inventory.itemContainer as unknown as string;
      if (!inventoryContainerId) {
        throw new Error("Inventory container id is not defined.");
      }

      if (appEnv.general.IS_UNIT_TEST) {
        return await this.execUnequip(character, item, inventoryContainerId);
      }

      await this.dynamicQueue.addJob(
        "unequip-item",
        async (job) => {
          const { character, item, inventoryContainerId } = job.data;
          const result = await this.execUnequip(character, item, inventoryContainerId);

          await this.resultsPoller.prepareResultToBePolled(
            "unequip-results",
            `unequip-${character._id}-${item._id}`,
            !!result
          );
        },
        { character, item, inventoryContainerId }
      );

      return await this.resultsPoller.pollResults("unequip-results", `unequip-${character?._id}-${item?._id}`);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private validateInputs(character: ICharacter, inventory: IItem, item: IItem): boolean {
    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry! Item not found.");
      return false;
    }

    if (!character) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry! Character not found.");
      return false;
    }

    if (!inventory) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry! You cannot unequip an item without an inventory. Drop it, instead."
      );
      return false;
    }

    if (!character.equipment) {
      this.socketMessaging.sendErrorMessageToCharacter(character);
      return false;
    }

    return true;
  }

  private async execUnequip(character: ICharacter, item: IItem, inventoryContainerId: string): Promise<boolean> {
    if (!(await this.isUnequipValid(character, item, inventoryContainerId))) {
      return false;
    }

    await this.clearPreTransactionCaches(character);

    const updatedItem = await this.getUpdatedItem(item);

    if (!(await this.hasItemOnEquipment(character, updatedItem))) {
      return false;
    }

    if (!(await this.performUnequipTransaction(character, updatedItem, inventoryContainerId))) {
      return false;
    }

    await this.updateOwnership(updatedItem, character);

    await this.clearPostTransactionCaches(character, item);

    await this.updateCharacterStateAfterUnequip(character, item, inventoryContainerId);

    return true;
  }

  private async clearPreTransactionCaches(character: ICharacter): Promise<void> {
    await this.inMemoryHashTable.delete("equipment-slots", character._id.toString());
    await clearCacheForKey(`${character._id}-equipment`);
    await clearCacheForKey(`${character._id}-inventory`);
  }

  private async getUpdatedItem(item: IItem): Promise<IItem> {
    return (await Item.findById(item._id).lean<IItem>({ virtuals: true, defaults: true })) || item;
  }

  private async hasItemOnEquipment(character: ICharacter, item: IItem): Promise<boolean> {
    return await this.characterItems.hasItem(item._id, character, "equipment");
  }

  private async updateCharacterStateAfterUnequip(
    character: ICharacter,
    item: IItem,
    inventoryContainerId: string
  ): Promise<void> {
    await Item.findByIdAndUpdate(item._id, { isEquipped: false }).lean();

    const newEquipmentSlots = await this.equipmentSlots.getEquipmentSlots(
      character._id,
      character.equipment as unknown as string
    );

    const newInventoryContainer = await ItemContainer.findById(inventoryContainerId).lean();

    this.socketMessaging.sendEventToUser(character.channelId!, ItemSocketEvents.EquipmentAndInventoryUpdate, {
      equipment: newEquipmentSlots,
      inventory: newInventoryContainer,
    });
  }

  private async clearPostTransactionCaches(character: ICharacter, item: IItem): Promise<void> {
    const buffs = await this.characterBuffTracker.getBuffsByItemId(character._id, item._id);

    for (const buff of buffs) {
      await this.characterBuffActivator.disableBuff(character, buff._id!, buff.type, true);
    }

    await this.clearCache(character);
  }

  private async updateOwnership(item: IItem, character: ICharacter): Promise<void> {
    await this.itemOwnership.addItemOwnership(item, character);
  }

  private async performUnequipTransaction(
    character: ICharacter,
    item: IItem,
    inventoryContainerId: string
  ): Promise<boolean> {
    try {
      const addItemToInventory = await this.characterItemContainer.addItemToContainer(
        item,
        character,
        inventoryContainerId
      );

      if (!addItemToInventory) {
        return false;
      }

      await this.characterItems.deleteItemFromContainer(item._id, character, "equipment");
    } catch (error) {
      await this.characterItems.deleteItemFromContainer(item._id, character, "inventory");
      console.error(error);
      return false;
    }

    return true;
  }

  private async clearCache(character: ICharacter): Promise<void> {
    await this.inMemoryHashTable.delete(character._id.toString(), "totalAttack");
    await this.inMemoryHashTable.delete(character._id.toString(), "totalDefense");

    await this.inMemoryHashTable.delete("character-weapon", character._id);
    await this.inMemoryHashTable.delete("equipment-slots", character._id);
    await this.inMemoryHashTable.delete("equipment-weight", character._id);
    await this.inMemoryHashTable.delete("character-shield", character._id);

    await clearCacheForKey(`${character._id}-inventory`);
    await clearCacheForKey(`${character._id}-equipment`);
    await clearCacheForKey(`characterBuffs_${character._id}`);
    await clearCacheForKey(`${character._id}-skills`);
    await this.inMemoryHashTable.delete("skills-with-buff", character._id);
  }

  private async isUnequipValid(character: ICharacter, item: IItem, inventoryContainerId: string): Promise<boolean> {
    if (!(await this.characterValidation.hasBasicValidation(character))) {
      return false;
    }

    if (!(await this.characterItems.hasItem(item._id, character, "equipment"))) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you cannot unequip an item that you don't have."
      );
      return false;
    }

    if (!(await this.characterItemSlots.hasAvailableSlot(inventoryContainerId, item))) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, your inventory is full.");
      return false;
    }

    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry! Item not found.");
      return false;
    }

    return true;
  }
}
