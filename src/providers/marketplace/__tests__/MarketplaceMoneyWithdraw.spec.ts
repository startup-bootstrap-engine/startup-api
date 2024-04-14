import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { MarketplaceMoney } from "@entities/ModuleMarketplace/MarketplaceMoneyModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterTradingBalance } from "@providers/character/CharacterTradingBalance";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
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
    // Create test character
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });
    testNPC = await unitTestHelper.createMockNPC({
      hasDepot: true,
    });

    testCharacter.x = 1;
    testCharacter.y = 0;
    await testCharacter.save();

    testNPC.x = 1;
    testNPC.y = 1;
    await testNPC.save();
  });

  it("should correctly withdraw all money if slots are available", async () => {
    await MarketplaceMoney.create({
      owner: testCharacter._id,
      money: 100,
    });

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
    await MarketplaceMoney.create({
      owner: testCharacter._id,
      money: 1000,
    });

    const gold = await unitTestHelper.createMockItem({
      stackQty: 9999,
      maxStackSize: 9999,
      key: OthersBlueprint.GoldCoin,
    });
    const inventory = await characterInventory.getInventory(testCharacter);
    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, {
      slots: {
        0: gold,
      },
    });

    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id);

    expect(success).toBe(true);
    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: testCharacter._id });
    expect(marketplaceMoney?.money).toBe(1000);
  });

  it("should correctly withdraw all money to available slot", async () => {
    await MarketplaceMoney.create({
      owner: testCharacter._id,
      money: 100,
    });

    const gold = await unitTestHelper.createMockItem({
      stackQty: 1000,
      maxStackSize: 10000,
      key: OthersBlueprint.GoldCoin,
    });
    const inventory = await characterInventory.getInventory(testCharacter);
    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, {
      slots: {
        0: gold,
      },
    });

    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id);

    expect(success).toBe(true);
    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: testCharacter._id });
    expect(marketplaceMoney).toBeNull();

    const container = await ItemContainer.findById(inventory?.itemContainer);
    expect(container?.slots[0].stackQty).toBe(1100);
  });

  it("should withdraw only part of the money if there is no space in bag", async () => {
    await MarketplaceMoney.create({
      owner: testCharacter._id,
      money: 110000,
    });

    const gold = await unitTestHelper.createMockItem({
      stackQty: 90000,
      maxStackSize: 99999,
      key: OthersBlueprint.GoldCoin,
    });
    const inventory = await characterInventory.getInventory(testCharacter);
    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, {
      slots: {
        0: null,
        1: gold,
      },
    });

    const success = await marketplaceMoneyWithdraw.withdrawMoneyFromMarketplace(testCharacter, testNPC._id);

    expect(success).toBe(true);
    const marketplaceMoney = await MarketplaceMoney.findOne({ owner: testCharacter._id });
    expect(marketplaceMoney?.money).toBe(2);

    const container = await ItemContainer.findById(inventory?.itemContainer);
    expect(container?.slots[0].stackQty).toBe(99999);
    expect(container?.slots[1].stackQty).toBe(99999);
  });

  it("should not rollback withdraw if update is successful", async () => {
    const blueprint = blueprintManager.getBlueprint<IItem>("items", OthersBlueprint.GoldCoin);
    const inventory = await characterInventory.getInventory(testCharacter);
    const inventoryContainerId = inventory?.itemContainer as unknown as string;

    const initialCharacterAvailableGold = 1000;
    const updatedGold = 100;

    // update gold is successful
    const gold = await unitTestHelper.createMockItem({
      stackQty: initialCharacterAvailableGold + updatedGold,
      maxStackSize: 10000,
      key: OthersBlueprint.GoldCoin,
    });

    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, {
      slots: {
        0: gold,
      },
    });

    // @ts-ignore
    const isRollbackSuccessful = await marketplaceMoneyWithdraw.checkAndRollbackMoneyWithdraw(
      testCharacter,
      blueprint,
      inventoryContainerId,
      updatedGold,
      initialCharacterAvailableGold
    );

    const availableGoldAfterRollback = await characterTradingBalance.getTotalGoldInInventory(testCharacter);

    expect(isRollbackSuccessful).toBe(false);
    expect(availableGoldAfterRollback).toBe(initialCharacterAvailableGold + updatedGold);
  });

  it("should rollback withdraw if no update was made", async () => {
    const blueprint = blueprintManager.getBlueprint<IItem>("items", OthersBlueprint.GoldCoin);
    const inventory = await characterInventory.getInventory(testCharacter);
    const inventoryContainerId = inventory?.itemContainer as unknown as string;

    const initialCharacterAvailableGold = 1000;
    const updatedGold = 100;

    // update gold in inventory is same as initial gold
    const gold = await unitTestHelper.createMockItem({
      stackQty: initialCharacterAvailableGold,
      maxStackSize: 10000,
      key: OthersBlueprint.GoldCoin,
    });

    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, {
      slots: {
        0: gold,
      },
    });

    // @ts-ignore
    const isRollbackSuccessful = await marketplaceMoneyWithdraw.checkAndRollbackMoneyWithdraw(
      testCharacter,
      blueprint,
      inventoryContainerId,
      updatedGold,
      initialCharacterAvailableGold
    );

    const availableGoldAfterRollback = await characterTradingBalance.getTotalGoldInInventory(testCharacter);

    expect(isRollbackSuccessful).toBe(true);
    expect(availableGoldAfterRollback).toBe(initialCharacterAvailableGold);
  });

  it("should rollback withdraw if update was less than it should be", async () => {
    const blueprint = blueprintManager.getBlueprint<IItem>("items", OthersBlueprint.GoldCoin);
    const inventory = await characterInventory.getInventory(testCharacter);
    const inventoryContainerId = inventory?.itemContainer as unknown as string;

    const initialCharacterAvailableGold = 1000;
    const updatedGold = 100;
    const actualUpdatedGold = 50;

    // update gold in less than it should be
    const gold = await unitTestHelper.createMockItem({
      stackQty: initialCharacterAvailableGold + actualUpdatedGold,
      maxStackSize: 10000,
      key: OthersBlueprint.GoldCoin,
    });

    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, {
      slots: {
        0: gold,
      },
    });

    // @ts-ignore
    const isRollbackSuccessful = await marketplaceMoneyWithdraw.checkAndRollbackMoneyWithdraw(
      testCharacter,
      blueprint,
      inventoryContainerId,
      updatedGold,
      initialCharacterAvailableGold
    );

    const availableGoldAfterRollback = await characterTradingBalance.getTotalGoldInInventory(testCharacter);

    expect(isRollbackSuccessful).toBe(true);
    expect(availableGoldAfterRollback).toBe(initialCharacterAvailableGold);
  });

  it("should rollback withdraw if update was grater than it should be", async () => {
    const blueprint = blueprintManager.getBlueprint<IItem>("items", OthersBlueprint.GoldCoin);
    const inventory = await characterInventory.getInventory(testCharacter);
    const inventoryContainerId = inventory?.itemContainer as unknown as string;

    const initialCharacterAvailableGold = 1000;
    const updatedGold = 100;
    const actualUpdatedGold = 150;

    // update gold in grater than it should be
    const gold = await unitTestHelper.createMockItem({
      stackQty: initialCharacterAvailableGold + actualUpdatedGold,
      maxStackSize: 10000,
      key: OthersBlueprint.GoldCoin,
    });

    await ItemContainer.findByIdAndUpdate(inventory?.itemContainer, {
      slots: {
        0: gold,
      },
    });

    // @ts-ignore
    const isRollbackSuccessful = await marketplaceMoneyWithdraw.checkAndRollbackMoneyWithdraw(
      testCharacter,
      blueprint,
      inventoryContainerId,
      updatedGold,
      initialCharacterAvailableGold
    );

    const availableGoldAfterRollback = await characterTradingBalance.getTotalGoldInInventory(testCharacter);

    expect(isRollbackSuccessful).toBe(true);
    expect(availableGoldAfterRollback).toBe(initialCharacterAvailableGold);
  });
});
