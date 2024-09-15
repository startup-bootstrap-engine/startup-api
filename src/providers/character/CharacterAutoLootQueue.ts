import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { appEnv } from "@providers/config/env";
import { GuildPayingTribute } from "@providers/guild/GuildPayingTribute";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { AnimationEffectKeys, IItemUpdate, ItemSocketEvents, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterValidation } from "./CharacterValidation";
import { CharacterView } from "./CharacterView";
import { CharacterItemContainer } from "./characterItems/CharacterItemContainer";
import { CharacterItemSlots } from "./characterItems/CharacterItemSlots";

@provideSingleton(CharacterAutoLootQueue)
export class CharacterAutoLootQueue {
  constructor(
    private characterValidation: CharacterValidation,
    private characterItemContainer: CharacterItemContainer,
    private socketMessaging: SocketMessaging,
    private characterInventory: CharacterInventory,
    private characterView: CharacterView,
    private animationEffect: AnimationEffect,
    private dynamicQueue: DynamicQueue,
    private guildPayingTribute: GuildPayingTribute,
    private locker: Locker,
    private characterItemSlots: CharacterItemSlots
  ) {}

  public async autoLoot(character: ICharacter, itemIdsToLoot: string[]): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execAutoLoot(character, itemIdsToLoot);
      return;
    }

    await this.dynamicQueue.addJob(
      "character-auto-loot",
      (job) => void this.execAutoLoot(job.data.character, job.data.itemIdsToLoot),
      { character, itemIdsToLoot }
    );
  }

  @TrackNewRelicTransaction()
  public async execAutoLoot(character: ICharacter, itemIdsToLoot: string[]): Promise<void> {
    try {
      if (!this.characterValidation.hasBasicValidation(character)) {
        return;
      }

      const inventoryItemContainer = await this.characterItemContainer.getInventoryItemContainer(character);
      if (!inventoryItemContainer) {
        this.sendErrorMessage(character, "Sorry, you cannot loot items without an inventory.");

        return;
      }

      const [bodies, itemContainerMap] = await this.getBodiesAndContainers(itemIdsToLoot);

      if (bodies.length === 0) {
        this.socketMessaging.sendMessageToCharacter(character, "No dead bodies found to loot.");
        return;
      }

      const lootedItemNamesAndQty: string[] = [];
      const disableLootingPromises: Promise<any>[] = [];

      for (const bodyItem of bodies) {
        const canProceed = await this.locker.lock(`loot-${bodyItem._id}`);
        if (!canProceed) {
          continue;
        }

        try {
          const itemContainer = itemContainerMap.get(String(bodyItem.itemContainer));
          if (!itemContainer) {
            console.log(`Item container with id ${bodyItem.itemContainer} not found`);
            continue;
          }

          const isCharacterDeadBody = await this.isCharacterDeadBody(bodyItem);

          for (const slot of Object.values(itemContainer.slots as Record<string, IItem>)) {
            if (!slot) continue;

            const item = await this.findItem(slot._id);
            if (!item) {
              continue;
            }

            let remainingQty = item.maxStackSize === 1 ? 1 : item.stackQty || 1;

            if (!isCharacterDeadBody) {
              remainingQty = await this.guildPayingTribute.payTribute(character, item);
            }

            if (remainingQty <= 0) {
              await this.handleFullDeduction(character, item, itemContainer, bodyItem);
              continue;
            }

            item.stackQty = remainingQty;

            const lootSuccess = await this.handleItemLooting(
              character,
              item,
              inventoryItemContainer,
              lootedItemNamesAndQty,
              itemContainer,
              bodyItem,
              disableLootingPromises
            );

            if (!lootSuccess) {
              // If looting fails, break the loop to prevent further attempts

              break;
            }
          }
        } catch (err) {
          console.error(`Error during auto-loot for body ${bodyItem._id}:`, err);
        } finally {
          await this.locker.unlock(`loot-${bodyItem._id}`);
        }
      }

      if (lootedItemNamesAndQty.length > 0) {
        this.socketMessaging.sendMessageToCharacter(character, `Auto-loot: ${lootedItemNamesAndQty.join(", ")}`);
      }

      await Promise.all([this.characterInventory.sendInventoryUpdateEvent(character), ...disableLootingPromises]);
    } catch (err) {
      console.error(`Unhandled error during auto-loot for character ${character._id}:`, err);
    }
  }

  private async getBodiesAndContainers(itemIdsToLoot: string[]): Promise<[IItem[], Map<string, IItemContainer>]> {
    const bodies = await Item.find({ _id: { $in: itemIdsToLoot } }).lean<IItem[]>({
      virtuals: true,
      defaults: true,
    });
    const itemContainerIds = bodies.map((body) => body.itemContainer);
    const itemContainers = await ItemContainer.find({ _id: { $in: itemContainerIds } }).lean<IItemContainer[]>({
      virtuals: true,
      defaults: true,
    });

    const itemContainerMap = new Map(itemContainers.map((ic) => [String(ic._id), ic]));
    return [bodies, itemContainerMap];
  }

  private async findItem(itemId: string): Promise<IItem | null> {
    const item = await Item.findOne({ _id: itemId }).lean<IItem>({
      virtuals: true,
      defaults: true,
    });
    if (!item) {
      console.log(`Item with id ${itemId} not found`);
    }
    return item;
  }

  private sendErrorMessage(character: ICharacter, message: string): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, message);
  }

  private async handleFullDeduction(
    character: ICharacter,
    item: IItem,
    itemContainer: IItemContainer,
    bodyItem: IItem
  ): Promise<void> {
    if (!(await this.characterItemContainer.removeItemFromContainer(item, character, itemContainer))) {
      console.log(`Failed to remove ${item.name} from body. Skipping...`);
      return;
    }
    await this.disableLooting(character, bodyItem);
  }

  private async handleItemLooting(
    character: ICharacter,
    item: IItem,
    inventoryItemContainer: IItemContainer,
    lootedItemNamesAndQty: string[],
    itemContainer: IItemContainer,
    bodyItem: IItem,
    disableLootingPromises: Promise<any>[]
  ): Promise<boolean> {
    const hasAvailableSlot = await this.characterItemSlots.hasAvailableSlot(inventoryItemContainer._id, item);

    if (!hasAvailableSlot) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, your inventory is full.");
      return false;
    }

    const addItemSuccess = await this.characterItemContainer.addItemToContainer(
      item,
      character,
      inventoryItemContainer._id,
      {
        shouldAddOwnership: true,
      }
    );

    if (!addItemSuccess) {
      console.log(`Failed to add ${item.name} to inventory. Skipping...`);
      return false;
    }

    // Handle stackQty for non-stackable items
    const itemStackQty = item.stackQty ?? 1;
    const removeItemSuccess = await this.characterItemContainer.removeItemFromContainer(item, character, itemContainer);
    if (!removeItemSuccess) {
      // If removal fails, attempt to remove the item from the character's inventory
      await this.characterItemContainer.removeItemFromContainer(item, character, inventoryItemContainer);
      console.log(`Failed to remove ${item.name} from body. Skipping...`);
      return false;
    }

    const quantityText = itemStackQty === 1 ? "1x" : `${itemStackQty}x`;
    lootedItemNamesAndQty.push(`${quantityText} ${item.name}`);
    disableLootingPromises.push(this.disableLooting(character, bodyItem));

    return true;
  }

  private async disableLooting(character: ICharacter, bodyItem: IItem): Promise<void> {
    const updatedBodyItem = await ItemContainer.findOne({ parentItem: bodyItem._id })
      .lean<IItemContainer>({ virtuals: true, defaults: true })
      .select("slots");

    if (!updatedBodyItem?.slots || Object.values(updatedBodyItem.slots as Record<string, IItem>).some((x) => !!x)) {
      return;
    }

    await Promise.all([
      Item.updateOne({ _id: bodyItem._id }, { $set: { isDeadBodyLootable: false } }),
      this.characterView.addToCharacterView(character._id, bodyItem._id, "items"),
      this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.LevelUp),
    ]);

    this.socketMessaging.sendEventToUser<Partial<IItemUpdate>>(character.channelId!, ItemSocketEvents.Update, {
      id: bodyItem._id,
      isDeadBodyLootable: false,
      textureAtlas: bodyItem.textureAtlas,
      texturePath: bodyItem.texturePath,
      type: bodyItem.type as ItemType,
      subType: bodyItem.subType as ItemSubType,
      name: bodyItem.name,
      x: bodyItem.x!,
      y: bodyItem.y!,
      scene: bodyItem.scene,
      layer: bodyItem.layer,
      stackQty: bodyItem.stackQty || 0,
      isStackable: bodyItem.maxStackSize > 1,
    });
  }

  private async isCharacterDeadBody(bodyItem: IItem): Promise<boolean> {
    // Check if the body item has an associated Character document
    const character = await Character.findOne({ _id: bodyItem.owner }).lean();
    return !!character;
  }

  public shutdown(): Promise<void> {
    return this.dynamicQueue.shutdown();
  }
}
