import { CharacterTradeSocketEvents, ItemSocketEvents, ITradeRequestItem, UserAccountTypes } from "@rpg-engine/shared";
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { BlueprintNamespaces } from "@providers/blueprint/BlueprintManager";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import {
  FoodsBlueprint,
  OthersBlueprint,
  PotionsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { IBlueprint } from "@providers/types/temp/BlueprintTypes";
import { CharacterTradingNPCBuy } from "../CharacterTradingNPCBuy";

describe("CharacterTradingValidation.ts", () => {
  let testCharacter: ICharacter;
  let testNPCTrader: INPC;

  let characterTradingNPCBuy: CharacterTradingNPCBuy;
  let sendErrorMessageToCharacter: jest.SpyInstance;
  let sendEventToUserOnBuyItem: jest.SpyInstance;
  let sendEventToUserOnInitBuy: jest.SpyInstance;
  let transactionItems: ITradeRequestItem[];
  let inventory: IItem;
  let inventoryContainer: IItemContainer;

  beforeAll(() => {
    characterTradingNPCBuy = container.get<CharacterTradingNPCBuy>(CharacterTradingNPCBuy);

    transactionItems = [
      {
        key: PotionsBlueprint.LightEndurancePotion,
        qty: 1,
      },
    ];
  });

  const prepareTransaction = async () => {
    testCharacter = await unitTestHelper.createMockCharacter(
      {
        x: 0,
        y: 0,
      },
      { hasEquipment: true, hasInventory: true, hasSkills: true }
    );

    testNPCTrader = await unitTestHelper.createMockNPC({
      x: 0,
      y: 0,
      isTrader: true,
      traderItems: [
        {
          key: PotionsBlueprint.LightEndurancePotion,
        },
        {
          key: SwordsBlueprint.ShortSword,
        },
        {
          key: FoodsBlueprint.Apple,
        },
        {
          key: FoodsBlueprint.Banana,
        },
      ],
    });

    sendErrorMessageToCharacter = jest.spyOn(
      // @ts-ignore
      characterTradingNPCBuy.characterTradingBuy.socketMessaging,
      "sendErrorMessageToCharacter"
    );

    sendEventToUserOnBuyItem = jest.spyOn(
      // @ts-ignore
      characterTradingNPCBuy.characterTradingBuy.socketMessaging,
      "sendEventToUser"
    );

    // @ts-ignore
    sendEventToUserOnInitBuy = jest.spyOn(characterTradingNPCBuy.socketMessaging, "sendEventToUser");

    inventory = await testCharacter.inventory;
    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;
  };

  describe("Transaction - Buy", () => {
    beforeEach(async () => {
      await prepareTransaction();

      const goldCoins = await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
        stackQty: 100,
      });

      inventoryContainer.slotQty = 20;
      inventoryContainer.slots = {
        ...inventoryContainer.slots,
        0: goldCoins.toJSON({ virtuals: true }),
      };
      inventoryContainer.markModified("slots");
      await inventoryContainer.save();
    });

    it("should properly buy a NON-STACKABLE item from a trader NPC", async () => {
      const result = await characterTradingNPCBuy.buyItemsFromNPC(testCharacter, testNPCTrader, transactionItems);

      expect(result).toBe(true);
      expect(sendErrorMessageToCharacter).not.toHaveBeenCalled();

      const updatedInventoryContainer = (await ItemContainer.findById(
        inventory.itemContainer
      )) as unknown as IItemContainer;

      expect(updatedInventoryContainer.slots[0].stackQty).toBe(77.5); // gold left
      expect(updatedInventoryContainer.slots[1].key).toBe(PotionsBlueprint.LightEndurancePotion); // potion bought

      expect(sendEventToUserOnBuyItem).toHaveBeenCalledWith(
        testCharacter.channelId!,
        ItemSocketEvents.EquipmentAndInventoryUpdate,
        {
          inventory: updatedInventoryContainer,
          openEquipmentSetOnUpdate: false,
          openInventoryOnUpdate: true,
        }
      );
    });

    it("should properly buy a STACKABLE item from a trader NPC", async () => {
      transactionItems = [
        {
          key: FoodsBlueprint.Apple,
          qty: 25,
        },
      ];

      const result = await characterTradingNPCBuy.buyItemsFromNPC(testCharacter, testNPCTrader, transactionItems);

      expect(result).toBe(true);

      expect(sendErrorMessageToCharacter).not.toHaveBeenCalled();

      const updatedInventoryContainer = (await ItemContainer.findById(
        inventory.itemContainer
      )) as unknown as IItemContainer;

      expect(updatedInventoryContainer.slots[0].stackQty).toBe(25); // gold left
      expect(updatedInventoryContainer.slots[1].key).toBe(FoodsBlueprint.Apple); // potion bought
      expect(updatedInventoryContainer.slots[1].stackQty).toBe(25);

      expect(sendEventToUserOnBuyItem).toHaveBeenCalledWith(
        testCharacter.channelId!,
        ItemSocketEvents.EquipmentAndInventoryUpdate,
        {
          inventory: updatedInventoryContainer,
          openEquipmentSetOnUpdate: false,
          openInventoryOnUpdate: true,
        }
      );
    });
  });

  interface ITransactionItem {
    key: string;
    qty: number;
  }

  describe("Premium accounts", () => {
    let testBanana: IItem;
    const key = FoodsBlueprint.Banana;

    // Utility function to remove object field
    const removeObjectField = <T extends object>(obj: T, fieldName: keyof T): Omit<T, keyof T> => {
      const { [fieldName]: _, ...rest } = obj;
      return rest;
    };

    const updateBlueprint = (namespace: BlueprintNamespaces, key: string, data: any): IBlueprint => {
      const blueprintIndex = blueprintManager.getBlueprintIndex<IBlueprint>(namespace);

      blueprintIndex[key] = data;

      return blueprintIndex;
    };

    // General setup for tests

    const setupTest = (accountType: UserAccountTypes | undefined) => {
      jest
        // @ts-ignore
        .spyOn(characterTradingNPCBuy.characterTradingBuy.characterUser, "findUserByCharacter")
        // @ts-ignore
        .mockResolvedValue({ accountType });
    };

    // Test scenarios
    const testScenarios = [
      { accountType: UserAccountTypes.Free, expectSuccess: [true, false, false, false, false] },
      { accountType: UserAccountTypes.PremiumBronze, expectSuccess: [false, true, false, false, false] },
      { accountType: UserAccountTypes.PremiumSilver, expectSuccess: [false, false, true, false, false] },
      { accountType: UserAccountTypes.PremiumGold, expectSuccess: [false, false, false, true, false] },
      { accountType: UserAccountTypes.PremiumUltimate, expectSuccess: [false, false, false, false, true] },
      { accountType: undefined, expectSuccess: [true, false, false, false, false] },
    ];

    beforeEach(async () => {
      await prepareTransaction();
      const goldCoins = await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
        stackQty: 100,
      });
      inventoryContainer.slotQty = 20;
      inventoryContainer.slots = {
        ...inventoryContainer.slots,
        0: goldCoins.toJSON({ virtuals: true }),
      };
      inventoryContainer.markModified("slots");
      await inventoryContainer.save();
      testBanana = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Banana);
    });

    testScenarios.forEach((scenario) => {
      it(`should give access for ${scenario.accountType ?? "undefined"} user types to ${
        scenario.accountType ?? "free"
      } item types`, async () => {
        // @ts-ignore
        setupTest(scenario.accountType);

        const accountTypes = Object.values(UserAccountTypes);
        for (let i = 0; i < accountTypes.length; i++) {
          const bananaWithoutId = removeObjectField(testBanana.toObject(), "_id");
          // @ts-ignore
          bananaWithoutId.canBePurchasedOnlyByPremiumPlans = [accountTypes[i]];
          updateBlueprint("items", key, bananaWithoutId);

          const transactionItems: ITransactionItem[] = [{ key: FoodsBlueprint.Banana, qty: 1 }];
          const result = await characterTradingNPCBuy.buyItemsFromNPC(testCharacter, testNPCTrader, transactionItems);
          expect(result).toBe(scenario.expectSuccess[i]);
        }
      });
    });
  });

  describe("Buy transaction initialization", () => {
    beforeEach(async () => {
      await prepareTransaction();

      const goldCoins = await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
        stackQty: 100,
      });

      inventoryContainer.slotQty = 20;
      inventoryContainer.slots = {
        ...inventoryContainer.slots,
        0: goldCoins.toJSON({ virtuals: true }),
      };
      inventoryContainer.markModified("slots");
      await inventoryContainer.save();
    });

    it("should properly initialize a buy transaction", async () => {
      await characterTradingNPCBuy.initializeBuy(testNPCTrader._id, testCharacter);

      const payload = {
        characterAvailableGold: 100,
        npcId: testNPCTrader._id,
        traderItems: expect.arrayContaining([
          expect.objectContaining({
            key: PotionsBlueprint.LightEndurancePotion,
          }),
        ]),
        type: "buy",
      };

      expect(sendEventToUserOnInitBuy).toHaveBeenCalledWith(
        testCharacter.channelId!,
        CharacterTradeSocketEvents.TradeInit,
        payload
      );
    });
  });

  describe("Error validations", () => {
    beforeEach(async () => {
      await prepareTransaction();
    });

    it("should fail if you try to buy a stackable item qty >= maxStackSize", async () => {
      transactionItems = [
        {
          key: FoodsBlueprint.Apple,
          qty: 9999,
        },
      ];

      const result = await characterTradingNPCBuy.buyItemsFromNPC(testCharacter, testNPCTrader, transactionItems);

      expect(result).toBe(false);

      expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
        testCharacter,
        "You can't buy more than the max stack size for the item 'Apple'."
      );
    });

    it("should fail if we don't have enough gold for a purchase", async () => {
      transactionItems = [
        {
          key: FoodsBlueprint.Apple,
          qty: 100,
        },
      ];

      const goldCoins = await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
        stackQty: 10,
      });

      inventoryContainer.slotQty = 20;
      inventoryContainer.slots = {
        ...inventoryContainer.slots,
        0: goldCoins.toJSON({ virtuals: true }),
      };
      inventoryContainer.markModified("slots");
      await inventoryContainer.save();

      const result = await characterTradingNPCBuy.buyItemsFromNPC(testCharacter, testNPCTrader, transactionItems);

      expect(result).toBe(false);
      expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
        testCharacter,
        "You don't have enough gold for this purchase."
      );
    });
  });
});
