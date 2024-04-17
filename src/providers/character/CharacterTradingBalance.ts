import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TRADER_BUY_PRICE_MULTIPLIER, TRADER_SELL_PRICE_MULTIPLIER } from "@providers/constants/ItemConstants";
import { AvailableBlueprints, OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { MathHelper } from "@providers/math/MathHelper";
import { ITradeRequestItem } from "@rpg-engine/shared";

import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { blueprintManager } from "@providers/inversify/container";
import { provide } from "inversify-binding-decorators";
import { CharacterNPCTradeType, CharacterTradingPriceControl } from "./CharacterTradingPriceControl";
import { CharacterItemInventory } from "./characterItems/CharacterItemInventory";
import { CharacterItemSlots } from "./characterItems/CharacterItemSlots";

@provide(CharacterTradingBalance)
export class CharacterTradingBalance {
  constructor(
    private characterItemSlots: CharacterItemSlots,
    private mathHelper: MathHelper,
    private characterItemInventory: CharacterItemInventory,
    private characterTradingPriceControl: CharacterTradingPriceControl
  ) {}

  @TrackNewRelicTransaction()
  public async getTotalGoldInInventory(character: ICharacter): Promise<number> {
    const items = await this.characterItemInventory.getAllItemsFromInventoryNested(character);

    const itemsQty = this.characterItemSlots.getTotalQtyByKey(items);
    const totalGold = itemsQty.get(OthersBlueprint.GoldCoin);

    return totalGold || 0;
  }

  @TrackNewRelicTransaction()
  public async calculateItemsTotalPrice(
    tradingEntityItems: Partial<IItem>[],
    items: ITradeRequestItem[],
    priceMultiplier: number,
    npc: INPC
  ): Promise<number> {
    return await items.reduce(async (totalPromise, item) => {
      const total = await totalPromise;
      const tradingEntityHasItem = tradingEntityItems.some((tradingItem) => tradingItem.key === item.key);

      if (!tradingEntityHasItem) {
        // if the trading entity (NPC or Marketplace) doesn't have an item,
        // do not take it into account into the total cost (because we won't sell it, anyway)
        return total;
      }

      return total + (await this.getItemPrice(item.key, priceMultiplier, npc, "buy")) * item.qty!;
    }, Promise.resolve(0));
  }

  @TrackNewRelicTransaction()
  public async getItemSellPrice(
    key: string,
    npc: INPC,
    priceMultiplier: number = TRADER_SELL_PRICE_MULTIPLIER
  ): Promise<number> {
    return await this.getItemPrice(key, priceMultiplier, npc, "sell");
  }

  @TrackNewRelicTransaction()
  public async getItemBuyPrice(
    key: string,
    npc: INPC,
    priceMultiplier: number = TRADER_BUY_PRICE_MULTIPLIER
  ): Promise<number> {
    return await this.getItemPrice(key, priceMultiplier, npc, "buy");
  }

  @TrackNewRelicTransaction()
  private async getItemPrice(
    key: string,
    multiplier: number,
    npc: INPC,
    tradingType: CharacterNPCTradeType
  ): Promise<number> {
    const basePrice = (await blueprintManager.getBlueprint<IItem>("items", key as AvailableBlueprints)).basePrice ?? 0;
    return (
      this.mathHelper.fixPrecision(basePrice * multiplier) *
      ((await this.characterTradingPriceControl.getPriceAdjustmentRatio(npc, key, tradingType)) ?? 1)
    );
  }
}
