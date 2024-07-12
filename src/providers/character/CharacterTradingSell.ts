/* eslint-disable mongoose-lean/require-lean */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { TRADER_SELL_PRICE_MULTIPLIER } from "@providers/constants/ItemConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { blueprintManager } from "@providers/inversify/container";
import { AvailableBlueprints, OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { MathHelper } from "@providers/math/MathHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NumberFormatter } from "@providers/text/NumberFormatter";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import Shared, {
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  ITradeRequestItem,
  ITradeResponseItem,
  ItemSocketEvents,
  TradingEntity,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterTradingBalance } from "./CharacterTradingBalance";
import { CharacterTradingPriceControl } from "./CharacterTradingPriceControl";
import { CharacterTradingValidation } from "./CharacterTradingValidation";
import { CharacterItemContainer } from "./characterItems/CharacterItemContainer";
import { CharacterItemInventory } from "./characterItems/CharacterItemInventory";
import { CharacterItemSlots } from "./characterItems/CharacterItemSlots";
import { CharacterWeightQueue } from "./weight/CharacterWeightQueue";

@provide(CharacterTradingSell)
export class CharacterTradingSell {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemContainer: CharacterItemContainer,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeightQueue,
    private characterTradingValidation: CharacterTradingValidation,
    private mathHelper: MathHelper,
    private characterItemSlots: CharacterItemSlots,
    private characterTradingBalance: CharacterTradingBalance,
    private characterInventory: CharacterInventory,
    private newRelic: NewRelic,
    private inMemoryHashTable: InMemoryHashTable,
    private characterTradingPriceControl: CharacterTradingPriceControl,
    private numberFormatter: NumberFormatter
  ) {}

  @TrackNewRelicTransaction()
  public async sellItems(
    character: ICharacter,
    items: ITradeRequestItem[],
    entityType: TradingEntity,
    npc: INPC
  ): Promise<void> {
    if (!items.length) {
      return;
    }

    items = this.mergeSameItems(items);

    let isValid = false;
    if (entityType === TradingEntity.NPC) {
      isValid = await this.characterTradingValidation.validateSellTransactionForNPC(character, npc!, items);
    }

    if (!isValid) {
      return;
    }

    const soldItems = await this.removeItemsFromInventory(items, character);
    if (!soldItems.length) {
      return;
    }

    await this.addGoldToInventory(soldItems, character, npc);

    await this.characterWeight.updateCharacterWeight(character);

    await clearCacheForKey(`${character._id}-inventory`);
    const inventoryItemContainer = (await this.characterInventory.getInventoryItemContainer(
      character
    )) as unknown as IItemContainer;
    await this.inMemoryHashTable.delete("container-all-items", inventoryItemContainer._id);

    await this.sendRefreshItemsEvent(character);

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      entityType === TradingEntity.NPC ? NewRelicSubCategory.NPCs : NewRelicSubCategory.Marketplace,
      "Sell",
      1
    );
  }

  private mergeSameItems(items: ITradeRequestItem[]): ITradeRequestItem[] {
    const obj = {};

    for (const item of items) {
      obj[item.key] = (obj[item.key] ?? 0) + item.qty;
    }

    const merged: ITradeRequestItem[] = [];
    for (const key in obj) {
      merged.push({
        key: key,
        qty: obj[key],
      });
    }

    return merged;
  }

  private async removeItemsFromInventory(
    items: ITradeRequestItem[],
    character: ICharacter
  ): Promise<ITradeRequestItem[]> {
    const removedItems: ITradeRequestItem[] = [];
    for (const item of items) {
      const res = await this.characterItemInventory.decrementItemFromNestedInventoryByKey(
        item.key,
        character,
        item.qty
      );
      if (res.success) {
        // item.qty = decrementQty
        // res.remainingQty = decrementQty - removedQty
        // use removedQty on the removedItems array
        // removedQty = decrementQty - remainingQty
        item.qty = item.qty - res.updatedQty;
        removedItems.push(item);
      }
    }
    // if an item is failed to decrement then error would be sent from inside the decrement function
    return removedItems;
  }

  private async addGoldToInventory(items: ITradeRequestItem[], character: ICharacter, npc: INPC): Promise<void> {
    const blueprint = await blueprintManager.getBlueprint<IItem>("items", OthersBlueprint.GoldCoin);

    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainerId = inventory?.itemContainer as unknown as string;

    let qty = await this.getItemGoldPrice(items, npc);

    let success = true;

    while (qty > 0) {
      const newItem = new Item({ ...blueprint, owner: character._id });

      if (newItem.maxStackSize >= qty) {
        newItem.stackQty = qty;
        qty = 0;
      } else {
        newItem.stackQty = newItem.maxStackSize;
        qty = this.mathHelper.fixPrecision(qty - newItem.maxStackSize);
      }

      await newItem.save();

      const wasAdded = await this.characterItemContainer.addItemToContainer(newItem, character, inventoryContainerId);

      success = success && wasAdded;
    }

    if (!success) {
      this.sendErrorOccurred(character);
    }
  }

  private async getItemGoldPrice(items: ITradeRequestItem[], npc: INPC): Promise<number> {
    let qty = 0;

    for (const item of items) {
      qty += item.qty * (await this.characterTradingBalance.getItemSellPrice(item.key, npc));

      await this.characterTradingPriceControl.recordCharacterNPCTradeOperation(npc, item.key, qty, item.qty, "sell");
    }

    qty = this.mathHelper.fixPrecision(qty);

    return qty;
  }

  private async sendRefreshItemsEvent(character: ICharacter): Promise<void> {
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as unknown as IItemContainer;

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: true,
    };

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }

  private sendErrorOccurred(character: ICharacter): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, "An error occurred while processing your trade.");
  }

  @TrackNewRelicTransaction()
  public async getCharacterItemsToSell(
    character: ICharacter,
    tradingEntity: TradingEntity,
    npc: INPC
  ): Promise<ITradeResponseItem[] | undefined> {
    const responseItems: ITradeResponseItem[] = [];
    const uniqueItems: string[] = [];
    let priceMultiplier = 1;

    const container = await this.characterItemContainer.getInventoryItemContainer(character);
    if (!container) {
      return;
    }

    const items = await this.characterItemInventory.getAllItemsFromInventoryNested(character);

    for (const item of items) {
      if (!uniqueItems.includes(item.baseKey)) {
        uniqueItems.push(item.baseKey);
      }
    }

    const itemsQty = this.characterItemSlots.getTotalQtyByKey(items);

    if (tradingEntity === TradingEntity.NPC) {
      priceMultiplier = TRADER_SELL_PRICE_MULTIPLIER;
    }

    for (const itemKey of uniqueItems) {
      const item = await blueprintManager.getBlueprint<IItem>("items", itemKey as AvailableBlueprints);

      if (!item || !item.basePrice || item.canSell === false) continue;

      const sellPrice = await this.characterTradingBalance.getItemSellPrice(itemKey, npc, priceMultiplier);

      if (!sellPrice) continue;

      responseItems.push({
        ...(item as unknown as Shared.IItem),
        price: this.numberFormatter.formatNumber(
          await this.characterTradingBalance.getItemSellPrice(item.key, npc, priceMultiplier)
        ),
        stackQty: itemsQty.get(itemKey),
      });
    }
    return responseItems;
  }
}
