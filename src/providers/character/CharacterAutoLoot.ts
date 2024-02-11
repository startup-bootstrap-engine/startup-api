import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { AnimationEffectKeys, EnvType, IItemUpdate, ItemSocketEvents } from "@rpg-engine/shared";
import { Queue, Worker } from "bullmq";
import { provide } from "inversify-binding-decorators";
import { v4 as uuidv4 } from "uuid";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterValidation } from "./CharacterValidation";
import { CharacterView } from "./CharacterView";
import { CharacterItemContainer } from "./characterItems/CharacterItemContainer";

@provide(CharacterAutoLoot)
export class CharacterAutoLoot {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;
  private queueName: string = `auto-loot-queue-${uuidv4()}-${
    appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id
  }`;

  constructor(
    private characterValidation: CharacterValidation,
    private characterItemContainer: CharacterItemContainer,
    private socketMessaging: SocketMessaging,
    private characterInventory: CharacterInventory,
    private characterView: CharacterView,
    private animationEffect: AnimationEffect,
    private redisManager: RedisManager
  ) {}

  public init(): void {
    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.queue) {
      this.queue = new Queue(this.queueName, {
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
        this.queueName,
        async (job) => {
          const { character, itemIdsToLoot } = job.data;

          try {
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
      this.init();
    }

    await this.queue?.add(
      this.queueName,
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
      const hasBasicValidation = this.characterValidation.hasBasicValidation(character);

      if (!hasBasicValidation) {
        return;
      }

      const inventoryItemContainer = (await this.characterItemContainer.getInventoryItemContainer(
        character
      )) as IItemContainer;

      if (!inventoryItemContainer) {
        throw new Error("Inventory item container not found");
      }

      const lootedItemNamesAndQty: string[] = [];

      const disableLootingPromises: Promise<any>[] = [];

      const bodies = await Item.find({ _id: { $in: itemIdsToLoot } }).lean<IItem[]>();

      for (const bodyItem of bodies) {
        const itemContainer = (await ItemContainer.findOne({ _id: bodyItem.itemContainer }).lean()) as IItemContainer;

        if (!itemContainer) {
          console.log(`Item container with id ${bodyItem.itemContainer} not found`);
          continue;
        }

        for (const slot of Object.values(itemContainer.slots as Record<string, IItem>)) {
          if (!slot) {
            continue;
          }

          const item = (await Item.findOne({ _id: slot._id }).lean()) as IItem;

          if (!item) {
            console.log(`Item with id ${slot._id} not found`);
            continue;
          }

          const addedToInventory = await this.characterItemContainer.addItemToContainer(
            item,
            character,
            inventoryItemContainer._id,
            {
              shouldAddOwnership: true,
              shouldAddAsCarriedItem: true,
            }
          );

          const removedFromBody = await this.characterItemContainer.removeItemFromContainer(
            item,
            character,
            itemContainer
          );

          if (!addedToInventory || !removedFromBody) {
            console.log(`Failed to add ${item.name} to inventory or remove from body`);
            continue;
          }

          const isStackableItem = item.maxStackSize > 1;

          if (isStackableItem && item.stackQty! > 1) {
            lootedItemNamesAndQty.push(`${item.name} (x${item.stackQty})`);
          } else {
            lootedItemNamesAndQty.push(item.name);
          }

          disableLootingPromises.push(this.disableLooting(character, bodyItem));
        }
      }

      if (lootedItemNamesAndQty.length > 0) {
        this.socketMessaging.sendMessageToCharacter(character, `Auto-loot: ${lootedItemNamesAndQty.join(", ")}`);
      }

      await Promise.all([this.characterInventory.sendInventoryUpdateEvent(character), disableLootingPromises]);
    } catch (error) {
      console.error(error);
    }
  }

  private async disableLooting(character: ICharacter, bodyItem: IItem): Promise<void> {
    await Item.updateOne(
      { _id: bodyItem._id },
      {
        $set: {
          isDeadBodyLootable: false,
        },
      }
    );

    await this.characterView.addToCharacterView(character._id, bodyItem._id, "items");

    this.socketMessaging.sendEventToUser<Partial<IItemUpdate>>(character.channelId!, ItemSocketEvents.Update, {
      id: bodyItem._id,
      isDeadBodyLootable: false,
    });

    await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.LevelUp);
  }
}
