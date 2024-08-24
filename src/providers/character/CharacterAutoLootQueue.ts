import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { appEnv } from "@providers/config/env";
import { GuildPayingTribute } from "@providers/guild/GuildPayingTribute";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { AnimationEffectKeys, IItemUpdate, ItemSocketEvents, ItemSubType, ItemType } from "@rpg-engine/shared";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterValidation } from "./CharacterValidation";
import { CharacterView } from "./CharacterView";
import { CharacterItemContainer } from "./characterItems/CharacterItemContainer";

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
    private guildPayingTribute: GuildPayingTribute
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
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, you cannot loot items without an inventory."
        );
        return;
      }

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
      const lootedItemNamesAndQty: string[] = [];
      const disableLootingPromises: Promise<any>[] = [];

      for (const bodyItem of bodies) {
        const itemContainer = itemContainerMap.get(String(bodyItem.itemContainer));
        if (!itemContainer) {
          console.log(`Item container with id ${bodyItem.itemContainer} not found`);
          continue;
        }

        for (const slot of Object.values(itemContainer.slots as Record<string, IItem>)) {
          if (!slot) continue;

          const item = await Item.findOne({ _id: slot._id }).lean<IItem>({
            virtuals: true,
            defaults: true,
          });
          if (!item) {
            console.log(`Item with id ${slot._id} not found`);
            continue;
          }

          // Calculate the actual quantity received by the player after tribute
          const remainingQty = await this.guildPayingTribute.payTribute(character, item);

          // If no quantity is left, skip adding it to the inventory
          if (remainingQty <= 0) {
            console.log(`Item ${item.name} fully deducted as tribute. Skipping...`);
            continue;
          }

          item.stackQty = remainingQty;

          const successfullyAddedItem = await this.characterItemContainer.addItemToContainer(
            item,
            character,
            inventoryItemContainer._id,
            { shouldAddOwnership: true }
          );

          if (!successfullyAddedItem) {
            console.log(`Failed to add ${item.name} to inventory. Skipping...`);
            continue;
          }

          const removedFromBody = await this.characterItemContainer.removeItemFromContainer(
            item,
            character,
            itemContainer
          );

          if (!removedFromBody) {
            console.log(`Failed to remove ${item.name} from body. Skipping...`);
            continue;
          }

          // Improve messaging: Always show quantity, even if it's 1
          const quantityText = item.stackQty === 1 ? "1x" : `x${item.stackQty}`;

          lootedItemNamesAndQty.push(`${quantityText} ${item.name}`);
          disableLootingPromises.push(this.disableLooting(character, bodyItem));
        }
      }

      if (lootedItemNamesAndQty.length > 0) {
        this.socketMessaging.sendMessageToCharacter(character, `Auto-loot: ${lootedItemNamesAndQty.join(", ")}`);
      }

      await Promise.all([this.characterInventory.sendInventoryUpdateEvent(character), ...disableLootingPromises]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async disableLooting(character: ICharacter, bodyItem: IItem): Promise<void> {
    // Only proceed if there are no lootable items
    const updatedBodyItem = await ItemContainer.findOne({ parentItem: bodyItem._id })
      .lean<IItemContainer>({
        virtuals: true,
        defaults: true,
      })
      .select("slots");

    if (!updatedBodyItem?.slots) return;

    const areAllSlotsEmpty = Object.values(updatedBodyItem.slots as Record<string, IItem>).every((x) => !x);

    if (!areAllSlotsEmpty) return;

    await Promise.all([
      Item.updateOne(
        { _id: bodyItem._id },
        {
          $set: { isDeadBodyLootable: false },
        }
      ),
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
}
