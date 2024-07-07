/* eslint-disable no-unused-vars */
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CharacterTradingPriceControl } from "../CharacterTradingPriceControl";

describe("CharacterTradingPriceControl", () => {
  let testNPC: INPC;
  let testItem: IItem;
  let testItem2: IItem;
  let characterTradingPriceControl: CharacterTradingPriceControl;

  beforeAll(() => {
    characterTradingPriceControl = container.resolve(CharacterTradingPriceControl);
  });

  beforeEach(async () => {
    testNPC = await unitTestHelper.createMockNPC();
    testItem = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Potato);
    testItem2 = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Apple);

    await characterTradingPriceControl.clearTradingHistoryFromNPC(testNPC);
  });

  it("should add an item to the trading history", async () => {
    await characterTradingPriceControl.recordCharacterNPCTradeOperation(testNPC, testItem.baseKey, 10, 1, "buy");
    const tradingHistory = await characterTradingPriceControl.getTradingHistory(testNPC);
    expect(tradingHistory[testItem.baseKey]).toBeDefined();
  });

  it("should handle multiple distinct items in trading history", async () => {
    const testItem2 = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Apple);

    await characterTradingPriceControl.recordCharacterNPCTradeOperation(testNPC, testItem.baseKey, 10, 1, "buy");
    await characterTradingPriceControl.recordCharacterNPCTradeOperation(testNPC, testItem2.key, 10, 1, "buy");

    const tradingHistory = await characterTradingPriceControl.getTradingHistory(testNPC);

    expect(tradingHistory[testItem.baseKey]).toBeDefined();
    expect(tradingHistory[testItem2.baseKey]).toBeDefined();
    expect(tradingHistory[testItem.baseKey].length).toBe(1);
    expect(tradingHistory[testItem2.baseKey].length).toBe(1);
  });

  describe("Price dynamics", () => {
    it("SELL: high selling pressure should decrease price", async () => {
      const priceAdjustmentRatio = await characterTradingPriceControl.getPriceAdjustmentRatio(
        testNPC,
        testItem.baseKey,
        "sell"
      );
      expect(priceAdjustmentRatio).toBe(1);

      for (let i = 0; i < 10; i++) {
        await characterTradingPriceControl.recordCharacterNPCTradeOperation(testNPC, testItem.baseKey, 10, 1, "sell");
      }

      const priceAdjustmentRatioAfter = await characterTradingPriceControl.getPriceAdjustmentRatio(
        testNPC,
        testItem.baseKey,
        "sell"
      );
      expect(priceAdjustmentRatioAfter).toBeLessThan(priceAdjustmentRatio);
      expect(priceAdjustmentRatioAfter).toBeLessThan(1);
    });

    it("BUY: Higher buyer demand should increase prices", async () => {
      for (let i = 0; i < 10; i++) {
        await characterTradingPriceControl.recordCharacterNPCTradeOperation(testNPC, testItem.baseKey, 10, 1, "buy");
      }

      const priceAdjustmentRatio = await characterTradingPriceControl.getPriceAdjustmentRatio(
        testNPC,
        testItem.baseKey,
        "buy"
      );
      expect(priceAdjustmentRatio).toBeGreaterThan(1);
    });
  });
});
