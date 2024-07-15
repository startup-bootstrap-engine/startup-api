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
      if (!inventory) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry! You cannot unequip an item without an inventory. Drop it, instead."
        );
        return false;
      }

      const inventoryContainerId = inventory?.itemContainer as unknown as string;

      if (!inventoryContainerId) {
        throw new Error("Inventory container id is not defined.");
      }

      if (!character.equipment) {
        this.socketMessaging.sendErrorMessageToCharacter(character);
        return false;
      }

      if (appEnv.general.IS_UNIT_TEST) {
        return await this.execUnequip(character, item, inventoryContainerId);
      }

      await this.dynamicQueue.addJob(
        "unequip-item",
        async (job) => {
          const { character, item, inventoryContainerId } = job.data;

          const result = await this.execUnequip(character, item, inventoryContainerId);

          await this.resultsPoller.prepareResultToBePolled("unequip-results", `${character._id}-${item._id}`, result);
        },
        { character, item, inventoryContainerId }
      );

      return await this.resultsPoller.pollResults("unequip-results", `${character._id}-${item._id}`);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private async execUnequip(character: ICharacter, item: IItem, inventoryContainerId: string): Promise<boolean> {
    const canUnequip = await this.isUnequipValid(character, item, inventoryContainerId);

    if (!canUnequip) {
      return false;
    }

    const equipmentSlots = await this.equipmentSlots.getEquipmentSlots(
      character._id,
      character.equipment as unknown as string
    );

    const updatedItem = (await Item.findById(item._id).lean<IItem>({ virtuals: true, defaults: true })) || item;

    const hasItemOnEquipment = await this.characterItems.hasItem(item._id, character, "equipment");

    if (!hasItemOnEquipment) {
      return false;
    }

    const hasUnequipped = await this.performUnequipTransaction(character, updatedItem, inventoryContainerId);

    if (!hasUnequipped) {
      return false;
    }

    const inventoryContainer = await ItemContainer.findById(inventoryContainerId).lean();

    this.socketMessaging.sendEventToUser(character.channelId!, ItemSocketEvents.EquipmentAndInventoryUpdate, {
      equipment: equipmentSlots,
      inventory: inventoryContainer,
    });

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

    const buffs = await this.characterBuffTracker.getBuffsByItemId(character._id, item._id);

    for (const buff of buffs) {
      await this.characterBuffActivator.disableBuff(character, buff._id!, buff.type, true);
    }

    await this.clearCache(character);

    if (!item.owner || item.owner.toString() !== character._id.toString()) {
      await this.itemOwnership.addItemOwnership(item, character);
    }

    return true;
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
    const baseValidation = await this.characterValidation.hasBasicValidation(character);

    if (!baseValidation) {
      return false;
    }

    const hasItemToBeUnequipped = await this.characterItems.hasItem(item._id, character, "equipment");

    if (!hasItemToBeUnequipped) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry, you cannot unequip an item that you don't have."
      );
      return false;
    }

    const hasSlotsAvailable = await this.characterItemSlots.hasAvailableSlot(inventoryContainerId, item);

    if (!hasSlotsAvailable) {
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
