import { INPC } from "@entities/ModuleNPC/NPCModel";
import {
  TRADING_PRICE_CONTROL_PRICE_RATIO_DATA_WINDOW_DAYS,
  TRADING_PRICE_CONTROL_RATIO_MAX_VALUE,
  TRADING_PRICE_CONTROL_RATIO_MIN_VALUE,
  TRADING_PRICE_CONTROL_RATIO_SENSITIVITY,
  TRADING_PRICE_CONTROL_SKIP_CONTROL,
  TRADING_PRICE_CONTROL_TRADING_HISTORY_MAX_DAYS,
} from "@providers/constants/CharacterTradingPriceControlConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";

export type CharacterNPCTradeType = "buy" | "sell";

interface IItemTradeHistory {
  price: number;
  quantity: number;
  boughtAt: Date;
  tradeType: CharacterNPCTradeType;
}

interface INPCTradingHistory {
  [itemId: string]: IItemTradeHistory[];
}

@provide(CharacterTradingPriceControl)
export class CharacterTradingPriceControl {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  public async getPriceAdjustmentRatio(
    npc: INPC,
    itemKey: string,
    operationType: CharacterNPCTradeType
  ): Promise<number> {
    if (TRADING_PRICE_CONTROL_SKIP_CONTROL.includes(itemKey as any)) {
      return 1; // Skip control for certain items
    }

    const currentTradingHistory: INPCTradingHistory =
      (await this.inMemoryHashTable.get("npc-trading-history", npc._id)) || ({} as INPCTradingHistory);

    if (!currentTradingHistory[itemKey] || currentTradingHistory[itemKey].length === 0) {
      return 1; // No adjustment if no history
    }

    const recentTrades = currentTradingHistory[itemKey].filter((trade) =>
      dayjs(trade.boughtAt).isAfter(dayjs().subtract(TRADING_PRICE_CONTROL_PRICE_RATIO_DATA_WINDOW_DAYS, "day"))
    );

    if (recentTrades.length === 0) {
      return 1; // No adjustment if no recent trades
    }

    const { totalBoughtValue, totalSoldValue } = recentTrades.reduce(
      (acc, trade) => {
        if (trade.tradeType === "buy") {
          acc.totalBoughtValue += trade.quantity * trade.price;
        } else if (trade.tradeType === "sell") {
          acc.totalSoldValue += trade.quantity * trade.price;
        }
        return acc;
      },
      { totalBoughtValue: 0, totalSoldValue: 0 }
    );

    // Calculate EMA
    const alpha = 2 / (recentTrades.length + 1);
    let ema = recentTrades[0].price;

    for (let i = 1; i < recentTrades.length; i++) {
      ema = alpha * recentTrades[i].price + (1 - alpha) * ema;
    }

    let adjustmentRatio = 1;

    if (operationType === "buy") {
      adjustmentRatio += Math.log(totalBoughtValue / ema + 1) * TRADING_PRICE_CONTROL_RATIO_SENSITIVITY;
    } else if (operationType === "sell") {
      adjustmentRatio -= Math.log(totalSoldValue / ema + 1) * TRADING_PRICE_CONTROL_RATIO_SENSITIVITY;
    }

    adjustmentRatio = Math.max(adjustmentRatio, TRADING_PRICE_CONTROL_RATIO_MIN_VALUE);
    adjustmentRatio = Math.min(adjustmentRatio, TRADING_PRICE_CONTROL_RATIO_MAX_VALUE);

    return adjustmentRatio;
  }

  public async recordCharacterNPCTradeOperation(
    npc: INPC,
    itemKey: string,
    itemPrice: number,
    itemQty: number,
    tradeType: CharacterNPCTradeType
  ): Promise<void> {
    if (!itemPrice) {
      throw new Error("Item does not have a price.");
    }

    const currentTradingHistory: INPCTradingHistory =
      (await this.inMemoryHashTable.get("npc-trading-history", npc._id)) || ({} as INPCTradingHistory);

    const itemTradeHistory: IItemTradeHistory = {
      price: itemPrice,
      quantity: itemQty || 1,
      boughtAt: new Date(),
      tradeType,
    };

    if (!currentTradingHistory[itemKey]) {
      currentTradingHistory[itemKey] = [];
    }

    currentTradingHistory[itemKey].push(itemTradeHistory);

    await this.inMemoryHashTable.set("npc-trading-history", npc._id, currentTradingHistory);
  }

  public async getTradingHistory(npc: INPC): Promise<INPCTradingHistory> {
    return (await this.inMemoryHashTable.get("npc-trading-history", npc._id)) || ({} as INPCTradingHistory);
  }

  public async clearTradingHistoryFromNPC(npc: INPC): Promise<void> {
    await this.inMemoryHashTable.delete("npc-trading-history", npc._id);
  }

  public async cleanupOldTradingHistory(): Promise<void> {
    const allTradingHistory = (await this.inMemoryHashTable.getAll("npc-trading-history")) as Record<
      string,
      INPCTradingHistory
    >;

    const XDaysAgo = dayjs().subtract(TRADING_PRICE_CONTROL_TRADING_HISTORY_MAX_DAYS, "days").toDate();

    for (const [npcId, tradingHistory] of Object.entries(allTradingHistory)) {
      for (const [itemId, itemTradeHistory] of Object.entries(tradingHistory)) {
        tradingHistory[itemId] = itemTradeHistory.filter((trade) => dayjs(trade.boughtAt).isAfter(XDaysAgo));
      }
      await this.inMemoryHashTable.set("npc-trading-history", npcId, tradingHistory);
    }
  }
}
