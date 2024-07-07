import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { TRADER_BUY_PRICE_MULTIPLIER } from "@providers/constants/ItemConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { blueprintManager } from "@providers/inversify/container";
import { AvailableBlueprints, OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SimpleTutorial } from "@providers/simpleTutorial/SimpleTutorial";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import {
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  ITradeRequestItem,
  ItemSocketEvents,
  ItemSubType,
  TradingEntity,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { capitalize } from "lodash";
import { clearCacheForKey } from "speedgoose";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterTradingBalance } from "./CharacterTradingBalance";
import { CharacterTradingPriceControl } from "./CharacterTradingPriceControl";
import { CharacterTradingValidation } from "./CharacterTradingValidation";
import { CharacterUser } from "./CharacterUser";
import { CharacterItemContainer } from "./characterItems/CharacterItemContainer";
import { CharacterItemInventory } from "./characterItems/CharacterItemInventory";
import { CharacterWeightQueue } from "./weight/CharacterWeightQueue";

@provide(CharacterTradingBuy)
export class CharacterTradingBuy {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterTradingBalance: CharacterTradingBalance,
    private characterItemContainer: CharacterItemContainer,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeightQueue,
    private characterTradingValidation: CharacterTradingValidation,
    private characterInventory: CharacterInventory,
    private newRelic: NewRelic,
    private characterUser: CharacterUser,
    private simpleTutorial: SimpleTutorial,
    private inMemoryHashTable: InMemoryHashTable,
    private characterTradingPriceControl: CharacterTradingPriceControl
  ) {}

  @TrackNewRelicTransaction()
  public async buyItems(
    character: ICharacter,
    tradingEntity: INPC,
    items: ITradeRequestItem[],
    tradingEntityType: TradingEntity,
    npc: INPC
  ): Promise<boolean> {
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainerId = inventory?.itemContainer as unknown as string;

    if (!inventoryContainerId) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "You don't have an inventory.");
      return false;
    }

    const isBuyTransactionValid = await this.validateBuyTransaction(
      character,
      tradingEntity,
      items,
      tradingEntityType,
      npc
    );

    if (!isBuyTransactionValid) {
      return false;
    }

    let tradingEntityItems: Partial<IItem>[] = [];
    let priceMultiplier = 1;

    if (tradingEntityType === TradingEntity.NPC) {
      priceMultiplier = TRADER_BUY_PRICE_MULTIPLIER;
      const entity = tradingEntity as INPC;
      tradingEntityItems = entity.traderItems as unknown as Partial<IItem>[];
    }

    for (const purchasedItem of items) {
      // check if the item to be purchased is actually available in the Trading entity (either NPC or Marketplace)

      const entityHasItem = tradingEntityItems.some((traderItem) => traderItem.key === purchasedItem.key);

      if (!entityHasItem) {
        continue;
      }

      // create the new item representation on the database
      const itemBlueprint = await blueprintManager.getBlueprint<IItem>(
        "items",
        purchasedItem.key as AvailableBlueprints
      );
      const isStackable = itemBlueprint?.maxStackSize! > 1;

      let wasItemAddedToContainer;

      if (isStackable) {
        // buy the whole stack at once
        const newItem = new Item({
          ...itemBlueprint,
          stackQty: purchasedItem.qty,
          owner: character._id,
        });
        // eslint-disable-next-line mongoose-lean/require-lean
        await newItem.save();

        // add it to the character's inventory
        wasItemAddedToContainer = await this.characterItemContainer.addItemToContainer(
          newItem,
          character,
          inventoryContainerId
        );

        if (!wasItemAddedToContainer) {
          this.socketMessaging.sendErrorMessageToCharacter(
            character,
            "An error occurred while processing your purchase."
          );
          await Item.deleteOne({ _id: newItem._id });
          return false;
        }
      } else {
        for (let i = 0; i < purchasedItem.qty; i++) {
          const newItem = new Item({
            ...itemBlueprint,
            owner: character._id,
          });
          // eslint-disable-next-line mongoose-lean/require-lean
          await newItem.save();

          // add it to the character's inventory
          wasItemAddedToContainer = await this.characterItemContainer.addItemToContainer(
            newItem,
            character,
            inventoryContainerId
          );

          if (!wasItemAddedToContainer) {
            this.socketMessaging.sendErrorMessageToCharacter(
              character,
              "An error occurred while processing your purchase."
            );

            await Item.deleteOne({ _id: newItem._id });
            return false;
          }
        }
      }

      if (wasItemAddedToContainer) {
        const itemPrice = await this.characterTradingBalance.getItemBuyPrice(purchasedItem.key, npc, priceMultiplier);

        if (!itemPrice) {
          this.socketMessaging.sendErrorMessageToCharacter(
            character,
            "The item price is not valid for item " + purchasedItem.key
          );
          return false;
        }

        const decrementQty = itemPrice * purchasedItem.qty;

        await this.inMemoryHashTable.delete("container-all-items", inventoryContainerId.toString()!);

        const decrementedGold = await this.characterItemInventory.decrementItemFromNestedInventoryByKey(
          OthersBlueprint.GoldCoin,
          character,
          decrementQty
        );

        if (!decrementedGold.success) {
          this.socketMessaging.sendErrorMessageToCharacter(
            character,
            "An error occurred while processing your purchase."
          );
          return false;
        }

        await this.characterTradingPriceControl.recordCharacterNPCTradeOperation(
          npc,
          purchasedItem.key,
          decrementQty,
          purchasedItem.qty,
          "buy"
        );
      }

      if (itemBlueprint.subType === ItemSubType.Seed) {
        await this.simpleTutorial.sendSimpleTutorialActionToCharacter(character, "buy-seed");
      }
    }

    // finally, update character's weight
    void this.characterWeight.updateCharacterWeight(character);

    // eslint-disable-next-line mongoose-lean/require-lean
    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as unknown as IItemContainer;

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: true,
    };

    this.sendRefreshItemsEvent(payloadUpdate, character);

    await clearCacheForKey(`${character._id}-inventory`);

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      tradingEntityType === TradingEntity.NPC ? NewRelicSubCategory.NPCs : NewRelicSubCategory.Marketplace,
      "Buy",
      1
    );

    return true;
  }

  public sendRefreshItemsEvent(payloadUpdate: IEquipmentAndInventoryUpdatePayload, character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }

  @TrackNewRelicTransaction()
  public async validateBuyTransaction(
    character: ICharacter,
    tradingEntity: INPC,
    itemsToPurchase: ITradeRequestItem[],
    tradingEntityType: TradingEntity,
    npc: INPC
  ): Promise<boolean> {
    let isBaseTransactionValid = false;
    let priceModifier = 1;
    let tradingItems: Partial<IItem>[] = [];

    if (tradingEntityType === TradingEntity.NPC) {
      priceModifier = TRADER_BUY_PRICE_MULTIPLIER;
      const entity = tradingEntity as INPC;
      isBaseTransactionValid = await this.characterTradingValidation.validateTransactionWithNPC(
        character,
        entity,
        itemsToPurchase
      );
      tradingItems = entity.traderItems as unknown as Partial<IItem>[];
    }

    if (!isBaseTransactionValid) {
      return false;
    }

    const user = await this.characterUser.findUserByCharacter(character);
    const userAccountType = user?.accountType || "free";

    for (const item of itemsToPurchase) {
      const itemBlueprint = await blueprintManager.getBlueprint<any>("items", item.key as AvailableBlueprints);

      if (!itemBlueprint) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, the item '${item.key}' is not available for purchase.`
        );
        return false;
      }

      const itemAccountTypes = itemBlueprint.canBePurchasedOnlyByPremiumPlans;

      if (itemAccountTypes !== undefined) {
        const isAvailable = itemAccountTypes.includes(userAccountType);
        if (!isAvailable) {
          this.socketMessaging.sendErrorMessageToCharacter(
            character,
            `Sorry, the item '${item.key}' is not available for your account type. Required : '${itemAccountTypes
              .map((item) => `${capitalize(item)} PA`)
              .join(" or ")}'`
          );
          return false;
        }
      }

      const isStackable = itemBlueprint?.maxStackSize! > 1;

      if (isStackable && item.qty > itemBlueprint?.maxStackSize!) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `You can't buy more than the max stack size for the item '${itemBlueprint.name}'.`
        );
        return false;
      }
    }

    // Does the character has enough gold to purchase all required items?

    const totalCost = await this.characterTradingBalance.calculateItemsTotalPrice(
      tradingItems,
      itemsToPurchase,
      priceModifier,
      npc
    );

    const characterTotalGoldInventory = await this.characterTradingBalance.getTotalGoldInInventory(character);

    const hasEnoughGold = characterTotalGoldInventory >= totalCost;

    if (!hasEnoughGold) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "You don't have enough gold for this purchase.");
      return false;
    }

    return true;
  }
}
