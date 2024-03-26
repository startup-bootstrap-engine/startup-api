import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { QueueCleaner } from "@providers/queue/QueueCleaner";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { AnimationEffectKeys, EnvType, IItemUpdate, ItemSocketEvents, ItemSubType, ItemType } from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterValidation } from "./CharacterValidation";
import { CharacterView } from "./CharacterView";
import { CharacterItemContainer } from "./characterItems/CharacterItemContainer";

@provideSingleton(CharacterAutoLootQueue)
export class CharacterAutoLootQueue {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;

  private queueName = (scene: string): string =>
    `auto-loot-queue--${appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id}-${scene}`;

  constructor(
    private characterValidation: CharacterValidation,
    private characterItemContainer: CharacterItemContainer,
    private socketMessaging: SocketMessaging,
    private characterInventory: CharacterInventory,
    private characterView: CharacterView,
    private animationEffect: AnimationEffect,
    private redisManager: RedisManager,
    private queueCleaner: QueueCleaner
  ) {}

  public init(scene: string): void {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue(this.queueName(scene), {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.queue.on("error", async (error) => {
          console.error(`Error in the ${this.queueName} :`, error);

          await this.queue?.close();
          this.queue = null;
        });
      }
    }

    if (!this.worker) {
      this.worker = new Worker(
        this.queueName(scene),
        async (job) => {
          const { character, itemIdsToLoot } = job.data;

          try {
            await this.queueCleaner.updateQueueActivity(this.queueName(scene));

            await this.execAutoLoot(character, itemIdsToLoot);
          } catch (err) {
            console.error(err);
            throw err;
          }
        },
        {
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.log(`${this.queueName} job ${job?.id} failed with error ${err.message}`);

          await this.worker?.close();
          this.worker = null;
        });
      }
    }
  }

  public async autoLoot(character: ICharacter, itemIdsToLoot: string[]): Promise<void> {
    if (!this.connection || !this.queue || !this.worker) {
      this.init(character.scene);
    }

    await this.queue?.add(
      this.queueName(character.scene),
      { character, itemIdsToLoot },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  @TrackNewRelicTransaction()
  public async execAutoLoot(character: ICharacter, itemIdsToLoot: string[]): Promise<void> {
    try {
      if (!this.characterValidation.hasBasicValidation(character)) {
        return;
      }

      const inventoryItemContainer = (await this.characterItemContainer.getInventoryItemContainer(
        character
      )) as IItemContainer;
      if (!inventoryItemContainer) {
        throw new Error("Inventory item container not found");
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
          if (!slot) {
            continue;
          }

          const item = (await Item.findOne({ _id: slot._id }).lean({
            virtuals: true,
            defaults: true,
          })) as IItem;
          if (!item) {
            console.log(`Item with id ${slot._id} not found`);
            continue;
          }

          const successfullyAddedItem = await this.characterItemContainer.addItemToContainer(
            item,
            character,
            inventoryItemContainer._id,
            {
              shouldAddOwnership: true,
            }
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

          lootedItemNamesAndQty.push(
            `${item.name}${item.maxStackSize > 1 && item.stackQty! > 1 ? ` (x${item.stackQty})` : ""}`
          );
          disableLootingPromises.push(this.disableLooting(character, bodyItem));
        }
      }

      if (lootedItemNamesAndQty.length > 0) {
        this.socketMessaging.sendMessageToCharacter(character, `Auto-loot: ${lootedItemNamesAndQty.join(", ")}`);
      }

      await Promise.all([this.characterInventory.sendInventoryUpdateEvent(character), ...disableLootingPromises]);
    } catch (error) {
      console.error(error);
    }
  }

  private async disableLooting(character: ICharacter, bodyItem: IItem): Promise<void> {
    // only proceed if there are no lootable items
    const updatedBodyItem = await ItemContainer.findOne({ parentItem: bodyItem._id })
      .lean<IItemContainer>({
        virtuals: true,
        defaults: true,
      })
      .select("slots");

    if (!updatedBodyItem?.slots) {
      return;
    }

    const areAllSlotsEmpty = Object.values(updatedBodyItem.slots as Record<string, IItem>).every((x) => !x);

    if (!areAllSlotsEmpty) {
      return;
    }

    await Promise.all([
      Item.updateOne(
        { _id: bodyItem._id },
        {
          $set: {
            isDeadBodyLootable: false,
          },
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
