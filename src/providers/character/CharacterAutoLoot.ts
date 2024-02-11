import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { AnimationEffectKeys, IItemUpdate, ItemSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterValidation } from "./CharacterValidation";
import { CharacterView } from "./CharacterView";
import { CharacterItemContainer } from "./characterItems/CharacterItemContainer";

@provide(CharacterAutoLoot)
export class CharacterAutoLoot {
  constructor(
    private characterValidation: CharacterValidation,
    private characterItemContainer: CharacterItemContainer,
    private socketMessaging: SocketMessaging,
    private characterInventory: CharacterInventory,
    private characterView: CharacterView,
    private animationEffect: AnimationEffect
  ) {}

  @TrackNewRelicTransaction()
  public async autoLoot(character: ICharacter, itemIdsToLoot: string[]): Promise<void> {
    try {
      const hasBasicValidation = this.characterValidation.hasBasicValidation(character);

      if (!hasBasicValidation) {
        return;
      }

      console.log("AutoLoot starting...");

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

        // perform the loot

        // loot through itemContainer slots

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

          lootedItemNamesAndQty.push(item.stackQty === 1 ? item.name : `${item.name} (x${item.stackQty})`);

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
