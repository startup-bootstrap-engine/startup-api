import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { MarketplaceMoney } from "@entities/ModuleMarketplace/MarketplaceMoneyModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterTradingBalance } from "@providers/character/CharacterTradingBalance";
import { container, unitTestHelper } from "@providers/inversify/container";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { MarketplaceMoneyWithdraw } from "../MarketplaceMoneyWithdraw";

describe("MarketplaceMoneyWithdraw.ts", () => {
  let marketplaceMoneyWithdraw: MarketplaceMoneyWithdraw;
  let testCharacter: ICharacter;
  let characterInventory: CharacterInventory;
  let testNPC: INPC;
  let characterTradingBalance: CharacterTradingBalance;

  beforeAll(() => {
    characterInventory = container.get(CharacterInventory);
    marketplaceMoneyWithdraw = container.get(MarketplaceMoneyWithdraw);
    characterTradingBalance = container.get(CharacterTradingBalance);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });
    testNPC = await unitTestHelper.createMockNPC({ hasDepot: true });
    testCharacter.x = 1;
    testCharacter.y = 0;
    await testCharacter.save();
    testNPC.x = 1;
    testNPC.y = 1;
    await testNPC.save();
  });

  it("should correctly withdraw all money if slots are available", async () => {
    await MarketplaceMoney.create({ owner: testCharacter._id, money: 100 });
    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id);
    expect(success).toBe(true);
    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: testCharacter._id });
    expect(marketplaceMoney).toBeNull();
  });

  it("should fail withdrawing money if no money is found", async () => {
    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id);
    expect(success).toBe(false);
  });

  it("should fail to withdraw money if there is no space in bag", async () => {
    await MarketplaceMoney.create({ owner: testCharacter._id, money: 1000 });
    const gold = await unitTestHelper.createMockItem({
      stackQty: 9999,
      maxStackSize: 9999,
      key: OthersBlueprint.GoldCoin,
    });
    const inventory = await characterInventory.getInventory(testCharacter);
    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, { slots: { 0: gold } });
    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id);
    expect(success).toBe(true);
    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: testCharacter._id });
    expect(marketplaceMoney?.money).toBe(1000);
  });

  it("should correctly withdraw all money to available slot", async () => {
    await MarketplaceMoney.create({ owner: testCharacter._id, money: 100 });
    const gold = await unitTestHelper.createMockItem({
      stackQty: 1000,
      maxStackSize: 10000,
      key: OthersBlueprint.GoldCoin,
    });
    const inventory = await characterInventory.getInventory(testCharacter);
    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, { slots: { 0: gold } });
    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id);
    expect(success).toBe(true);
    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: testCharacter._id });
    expect(marketplaceMoney).toBeNull();
    const container = await ItemContainer.findById(inventory?.itemContainer);
    expect(container?.slots[0].stackQty).toBe(1100);
  });

  it("should withdraw only part of the money if there is no space in bag", async () => {
    await MarketplaceMoney.create({ owner: testCharacter._id, money: 110000 });
    const gold = await unitTestHelper.createMockItem({
      stackQty: 90000,
      maxStackSize: 99999,
      key: OthersBlueprint.GoldCoin,
    });
    const inventory = await characterInventory.getInventory(testCharacter);
    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, { slots: { 0: null, 1: gold } });
    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id);
    expect(success).toBe(true);
    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: testCharacter._id });
    expect(marketplaceMoney?.money).toBe(2);
    const container = await ItemContainer.findById(inventory?.itemContainer);
    expect(container?.slots[0].stackQty).toBe(99999);
    expect(container?.slots[1].stackQty).toBe(99999);
  });

  it("should handle invalid character ID", async () => {
    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(
      { _id: "invalid" } as ICharacter,
      testNPC._id
    );
    expect(success).toBe(false);
  });

  it("should handle invalid NPC ID", async () => {
    await MarketplaceMoney.create({ owner: testCharacter._id, money: 100 });
    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, "invalid");
    expect(success).toBe(false);
  });

  it("should handle concurrent withdraw attempts", async () => {
    await MarketplaceMoney.create({ owner: testCharacter._id, money: 100 });
    const [success1, success2] = await Promise.all([
      marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id),
      marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id),
    ]);
    expect(success1).toBe(true);
    expect(success2).toBe(false);
  });

  it("should handle partial withdrawal with multiple items", async () => {
    await MarketplaceMoney.create({ owner: testCharacter._id, money: 200 });
    const gold1 = await unitTestHelper.createMockItem({
      stackQty: 50,
      maxStackSize: 100,
      key: OthersBlueprint.GoldCoin,
    });
    const gold2 = await unitTestHelper.createMockItem({
      stackQty: 50,
      maxStackSize: 100,
      key: OthersBlueprint.GoldCoin,
    });
    const inventory = await characterInventory.getInventory(testCharacter);
    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, { slots: { 0: gold1, 1: gold2 } });

    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id);
    expect(success).toBe(true);

    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: testCharacter._id });
    expect(marketplaceMoney?.money).toBe(100); // Expect 100 remaining as only 100 was added to the inventory

    const container = await ItemContainer.findById(inventory?.itemContainer);
    expect(container?.slots[0].stackQty).toBe(100);
    expect(container?.slots[1].stackQty).toBe(100);
  });
});
