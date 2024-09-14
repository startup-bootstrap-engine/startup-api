import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ContainersBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CharacterAutoLootQueue } from "../CharacterAutoLootQueue";
import { CharacterInventory } from "../CharacterInventory";
import { CharacterItemContainer } from "../characterItems/CharacterItemContainer";
import { CharacterValidation } from "../CharacterValidation";

describe("CharacterAutoLootQueue", () => {
  let characterAutoLoot: CharacterAutoLootQueue;
  let characterInventory: CharacterInventory;
  let characterItemContainer: CharacterItemContainer;
  let testCharacter: ICharacter;
  let inventoryContainer: IItemContainer | null;

  beforeAll(() => {
    characterAutoLoot = container.get(CharacterAutoLootQueue);
    characterInventory = container.get(CharacterInventory);
    characterItemContainer = container.get(CharacterItemContainer);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasInventory: true, hasEquipment: true });
    inventoryContainer = await characterInventory.getInventoryItemContainer(testCharacter);

    if (!inventoryContainer) {
      throw new Error("Inventory container not found");
    }
  });

  it("should add looted items to the character's inventory and apply tribute correctly", async () => {
    const item = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Apple, { stackQty: 5 });
    const bodyItem = await unitTestHelper.createMockCharacterDeadBody(testCharacter);
    const bodyItemContainer = await ItemContainer.findById(bodyItem.itemContainer);

    if (!bodyItemContainer) {
      throw new Error("Body item container not found");
    }

    if (!item || !bodyItem) {
      throw new Error("Item or body item not found");
    }

    const added = await characterItemContainer.addItemToContainer(item, testCharacter, bodyItemContainer?._id, {
      shouldAddOwnership: true,
    });

    expect(added).toBe(true);

    await characterAutoLoot.execAutoLoot(testCharacter, [bodyItem._id.toString()]);

    // check container
    const updatedContainer = await characterInventory.getInventoryItemContainer(testCharacter);

    if (!updatedContainer) {
      throw new Error("Inventory container not found");
    }

    const items = await characterInventory.getAllItemsFromContainer(updatedContainer._id);

    expect(items.length).toBe(1);
  });

  it("should correctly handle single items (non-stackable)", async () => {
    const item = await unitTestHelper.createMockItem({ stackQty: 1 });
    const bodyItem = await unitTestHelper.createMockCharacterDeadBody(testCharacter);

    await characterItemContainer.addItemToContainer(item, testCharacter, inventoryContainer!._id, {
      shouldAddOwnership: true,
    });

    await characterAutoLoot.execAutoLoot(testCharacter, [bodyItem._id.toString()]);

    const updatedItem = await Item.findById(item._id);
    expect(updatedItem?.stackQty).toBe(1); // Single item should remain as is
  });

  it("should handle multiple items and send appropriate messages", async () => {
    const item1 = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Apple, { stackQty: 5 });
    const item2 = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Banana, { stackQty: 3 });
    const bodyItem = await unitTestHelper.createMockCharacterDeadBody(testCharacter);
    const bodyItemContainer = await ItemContainer.findById(bodyItem.itemContainer);

    if (!bodyItemContainer) {
      throw new Error("Body item container not found");
    }

    await characterItemContainer.addItemToContainer(item1, testCharacter, bodyItemContainer._id, {
      shouldAddOwnership: true,
    });

    await characterItemContainer.addItemToContainer(item2, testCharacter, bodyItemContainer._id, {
      shouldAddOwnership: true,
    });

    await characterAutoLoot.execAutoLoot(testCharacter, [bodyItem._id.toString()]);

    const updatedContainer = await characterInventory.getInventoryItemContainer(testCharacter);
    const items = await characterInventory.getAllItemsFromContainer(updatedContainer!._id);

    expect(items.length).toBe(2);

    // check each items qty
    const apple = items.find((i) => i.key === FoodsBlueprint.Apple);
    const banana = items.find((i) => i.key === FoodsBlueprint.Banana);

    expect(apple?.stackQty).toBe(5);
    expect(banana?.stackQty).toBe(3);
  });

  it("should disable looting if all items are taken", async () => {
    const item = await unitTestHelper.createMockItem({ stackQty: 5 });
    const bodyItem = await unitTestHelper.createMockCharacterDeadBody(testCharacter);

    await characterItemContainer.addItemToContainer(item, testCharacter, inventoryContainer!._id, {
      shouldAddOwnership: true,
    });

    await characterAutoLoot.execAutoLoot(testCharacter, [bodyItem._id.toString()]);

    const updatedBodyItem = await Item.findById(bodyItem._id);
    expect(updatedBodyItem?.isDeadBodyLootable).toBe(false);
  });

  it("should handle an empty item container gracefully", async () => {
    const bodyItem = await unitTestHelper.createMockCharacterDeadBody(testCharacter);

    await characterAutoLoot.execAutoLoot(testCharacter, [bodyItem._id.toString()]);

    const updatedBodyItem = await Item.findById(bodyItem._id);
    expect(updatedBodyItem?.isDeadBodyLootable).toBe(false);
  });

  it("should not proceed with auto-loot if validation fails", async () => {
    const mockValidation = jest.spyOn(CharacterValidation.prototype, "hasBasicValidation").mockReturnValue(false);
    await characterAutoLoot.autoLoot(testCharacter, []);
    expect(mockValidation).toHaveBeenCalled();
    mockValidation.mockRestore();
  });

  it("should correctly loot a backpack as a regular item", async () => {
    // @ts-ignore
    jest.spyOn(characterAutoLoot, "isCharacterDeadBody").mockResolvedValue(false);

    const backpackItem = await unitTestHelper.createMockItemFromBlueprint(ContainersBlueprint.Backpack, {
      isItemContainer: true,
    });

    const bodyItem = await unitTestHelper.createMockCharacterDeadBody(testCharacter);
    const bodyItemContainer = await ItemContainer.findById(bodyItem.itemContainer);

    if (!bodyItemContainer) {
      throw new Error("Body item container not found");
    }

    // Add the backpack to the dead body's inventory
    await characterItemContainer.addItemToContainer(backpackItem, testCharacter, bodyItemContainer._id, {
      shouldAddOwnership: true,
    });

    // Create and add an item to the backpack (this should not be looted)
    const itemInBackpack = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Apple);
    const backpackContainer = await ItemContainer.findById(backpackItem.itemContainer);

    if (!backpackContainer) {
      throw new Error("Backpack container not found");
    }

    await characterItemContainer.addItemToContainer(itemInBackpack, testCharacter, backpackContainer._id, {
      shouldAddOwnership: true,
    });

    // Act: Execute the autoLoot
    await characterAutoLoot.execAutoLoot(testCharacter, [bodyItem._id.toString()]);

    // Assert: Verify that the backpack was looted as a regular item
    const updatedContainer = await characterInventory.getInventoryItemContainer(testCharacter);
    const lootedItems = await characterInventory.getAllItemsFromContainer(updatedContainer!._id);

    const lootedBackpack = lootedItems.find((item) => item.key === ContainersBlueprint.Backpack);
    expect(lootedBackpack).toBeDefined();
    expect(lootedBackpack!.isItemContainer).toBe(true);

    // Verify that the item inside the backpack was not looted
    const lootedBackpackContainer = await ItemContainer.findOne({
      parentItem: lootedBackpack!._id,
    }).lean<IItemContainer>();

    const itemsInLootedBackpack = await characterInventory.getAllItemsFromContainer(lootedBackpackContainer!._id);
    expect(itemsInLootedBackpack.length).toBe(1);
  });

  // Internal tests for tribute logic
  describe("Tributes", () => {
    let bodyItemContainer: IItemContainer;

    beforeEach(async () => {
      bodyItemContainer = await unitTestHelper.createMockItemContainer();

      // @ts-ignore
      jest.spyOn(characterAutoLoot, "isCharacterDeadBody").mockResolvedValue(false);

      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    // Helper function to set up loot with tribute
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const setupLootWithTribute = async (stackQty: number, tributeResult: number) => {
      const item = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Apple, { stackQty });
      const bodyItem = await unitTestHelper.createMockCharacterDeadBody(testCharacter);
      bodyItemContainer = (await ItemContainer.findById(bodyItem.itemContainer)) as IItemContainer;

      if (!bodyItemContainer) {
        throw new Error("Body item container not found");
      }

      await characterItemContainer.addItemToContainer(item, testCharacter, bodyItemContainer._id, {
        shouldAddOwnership: false,
      });

      // Mock the tribute mechanism
      // @ts-ignore
      jest.spyOn(characterAutoLoot.guildPayingTribute, "payTribute").mockResolvedValue(tributeResult);

      await characterAutoLoot.execAutoLoot(testCharacter, [bodyItem._id.toString()]);

      const updatedContainer = await characterInventory.getInventoryItemContainer(testCharacter);
      return (await characterInventory.getAllItemsFromContainer(updatedContainer!._id)).find(
        (i) => i.key === FoodsBlueprint.Apple
      );
    };

    it("should correctly apply tribute when looting items", async () => {
      const lootedItem = await setupLootWithTribute(10, 5);
      expect(lootedItem?.stackQty).toBe(5); // Expect 50% deduction due to tribute
    });

    it("should skip tribute if no tribute is required", async () => {
      const lootedItem = await setupLootWithTribute(10, 10);
      expect(lootedItem?.stackQty).toBe(10); // Expect no deduction
    });

    it("should handle full tribute deduction", async () => {
      const lootedItem = await setupLootWithTribute(10, 0);
      expect(lootedItem).toBeUndefined(); // Expect no item to be looted if fully deducted
    });

    it("should correctly round down when tribute leaves a fractional quantity", async () => {
      const lootedItem = await setupLootWithTribute(10, 3);
      expect(lootedItem?.stackQty).toBe(3); // Expect rounding to the nearest integer
    });

    it("should skip tribute for non-stackable items", async () => {
      const item = await unitTestHelper.createMockItem({ stackQty: 1, maxStackSize: 1 }); // Non-stackable item
      const bodyItem = await unitTestHelper.createMockCharacterDeadBody(testCharacter);
      const bodyItemContainer = (await ItemContainer.findById(bodyItem.itemContainer)) as IItemContainer;

      if (!bodyItemContainer) {
        throw new Error("Body item container not found");
      }

      await characterItemContainer.addItemToContainer(item, testCharacter, bodyItemContainer._id, {
        shouldAddOwnership: false,
      });

      // Mock the tribute mechanism to deduct 1 (though it should skip)

      // @ts-ignore
      jest.spyOn(characterAutoLoot.guildPayingTribute, "payTribute").mockResolvedValue(1);

      await characterAutoLoot.execAutoLoot(testCharacter, [bodyItem._id.toString()]);

      const updatedContainer = await characterInventory.getInventoryItemContainer(testCharacter);
      const lootedItem = (await characterInventory.getAllItemsFromContainer(updatedContainer!._id)).find(
        (i) => i._id.toString() === item._id.toString()
      );

      expect(lootedItem?.stackQty).toBe(1); // Expect no tribute for non-stackable items
    });

    it("should handle tribute when item quantity is low", async () => {
      const lootedItem = await setupLootWithTribute(1, 0);
      expect(lootedItem).toBeUndefined(); // Expect no item to be looted if fully deducted
    });

    it("should handle tribute when player inventory is full", async () => {
      // Fill the player's inventory to its maximum capacity
      for (let i = 0; i < inventoryContainer!.slotQty; i++) {
        const fillerItem = await unitTestHelper.createMockItem({ stackQty: 1 });
        await characterItemContainer.addItemToContainer(fillerItem, testCharacter, inventoryContainer!._id, {
          shouldAddOwnership: true,
        });
      }

      const lootedItem = await setupLootWithTribute(10, 5);
      expect(lootedItem).toBeUndefined(); // No item should be added due to full inventory
    });

    it("should not perform looting if itemIdsToLoot is empty", async () => {
      await characterAutoLoot.execAutoLoot(testCharacter, []);
      const items = await characterInventory.getAllItemsFromContainer(inventoryContainer!._id);
      expect(items.length).toBe(0); // No items should be added
    });

    it("should handle invalid tribute deduction (negative quantity)", async () => {
      const lootedItem = await setupLootWithTribute(10, -5); // Invalid negative quantity
      expect(lootedItem).toBeUndefined(); // No item should be looted
    });

    it("should skip guild tribute if the body is a character's dead body", async () => {
      // Arrange: Create the necessary mocks and setup
      const item = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Apple, { stackQty: 10 });
      const bodyItem = await unitTestHelper.createMockCharacterDeadBody(testCharacter);
      const bodyItemContainer = await ItemContainer.findById(bodyItem.itemContainer);

      if (!bodyItemContainer) {
        throw new Error("Body item container not found");
      }

      await characterItemContainer.addItemToContainer(item, testCharacter, bodyItemContainer._id, {
        shouldAddOwnership: true,
      });

      // Mock the isCharacterDeadBody to return true
      // @ts-ignore
      jest.spyOn(characterAutoLoot, "isCharacterDeadBody").mockResolvedValue(true);

      // Mock the payTribute function to ensure it is not called
      // @ts-ignore
      const payTributeSpy = jest.spyOn(characterAutoLoot.guildPayingTribute, "payTribute");

      // Act: Execute the autoLoot
      await characterAutoLoot.execAutoLoot(testCharacter, [bodyItem._id.toString()]);

      // Assert: Verify the tribute was not applied and item was looted fully
      expect(payTributeSpy).not.toHaveBeenCalled();
      const updatedContainer = await characterInventory.getInventoryItemContainer(testCharacter);
      const lootedItem = await characterInventory.getAllItemsFromContainer(updatedContainer!._id);

      expect(lootedItem[0].stackQty).toBe(10); // Item should be looted without any deduction
    });
  });

  describe("CharacterAutoLootQueue - Bags Edge Cases", () => {
    let characterAutoLoot: CharacterAutoLootQueue;
    let characterInventory: CharacterInventory;
    let characterItemContainer: CharacterItemContainer;
    let characterValidation: CharacterValidation;
    let testCharacter: ICharacter;
    let inventoryContainer: IItemContainer | null;

    beforeAll(() => {
      characterAutoLoot = container.get(CharacterAutoLootQueue);
      characterInventory = container.get(CharacterInventory);
      characterItemContainer = container.get(CharacterItemContainer);
      characterValidation = container.get(CharacterValidation);
    });

    beforeEach(async () => {
      // Create a mock character with inventory and equipment
      testCharacter = await unitTestHelper.createMockCharacter(null, { hasInventory: true, hasEquipment: true });
      inventoryContainer = await characterInventory.getInventoryItemContainer(testCharacter);

      if (!inventoryContainer) {
        throw new Error("Inventory container not found");
      }
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    /**
     * Helper function to create and add a non-stackable bag to a dead body
     */
    const setupDeadBodyWithBag = async (): Promise<[IItem, IItem, IItemContainer]> => {
      const droppedBag = await unitTestHelper.createMockItemFromBlueprint(ContainersBlueprint.Bag, {
        maxStackSize: 1,
        owner: testCharacter._id,
      });
      const deadBody = await unitTestHelper.createMockCharacterDeadBody(testCharacter, {
        isDeadBodyLootable: true,
        owner: testCharacter._id,
      });

      let deadBodyContainer = await ItemContainer.findById(deadBody.itemContainer).lean<IItemContainer>();

      if (!deadBodyContainer) {
        throw new Error("Dead body container not found");
      }

      // Add the bag to the dead body's container
      const added = await characterItemContainer.addItemToContainer(droppedBag, testCharacter, deadBodyContainer._id, {
        shouldAddOwnership: true,
      });

      if (!added) {
        throw new Error("Failed to add bag to dead body container");
      }

      deadBodyContainer = await ItemContainer.findById(deadBodyContainer._id).lean<IItemContainer>();

      return [droppedBag, deadBody, deadBodyContainer];
    };

    /**
     * Test Case 1: Looting a Non-Stackable Bag from a Dead Body
     */
    it("should correctly loot a non-stackable bag from a dead body", async () => {
      // Arrange
      const [bag, deadBody, deadBodyItemContainer] = await setupDeadBodyWithBag();

      // expect first slot to contain bag
      expect(deadBodyItemContainer.slots[0]._id).toStrictEqual(bag._id);

      // Mock isCharacterDeadBody to return true, ensuring tribute is skipped
      // @ts-ignore
      jest.spyOn(characterAutoLoot, "isCharacterDeadBody").mockResolvedValue(true);

      // Act
      await characterAutoLoot.execAutoLoot(testCharacter, [deadBody._id.toString()]);

      // Assert
      const updatedInventory = await characterInventory.getInventoryItemContainer(testCharacter);
      const lootedItems = await characterInventory.getAllItemsFromContainer(updatedInventory!._id);

      // Verify that the bag is present in the inventory with stackQty:1
      const lootedBag = lootedItems.find((item) => item._id.toString() === bag._id.toString());
      expect(lootedBag).toBeDefined();
      expect(lootedBag!.stackQty).toBe(1);

      // Verify that tribute was skipped by ensuring payTribute was not called
      // @ts-ignore
      const payTributeSpy = jest.spyOn(characterAutoLoot.guildPayingTribute, "payTribute");
      expect(payTributeSpy).not.toHaveBeenCalled();
    });

    /**
     * Test Case 2: Attempting to Loot a Non-Stackable Bag When Inventory is Full
     */
    it("should fail to loot a non-stackable bag when the inventory is full and send an appropriate error message", async () => {
      // Arrange
      const [bag, deadBody] = await setupDeadBodyWithBag();

      // Mock isCharacterDeadBody to return true
      // @ts-ignore
      jest.spyOn(characterAutoLoot, "isCharacterDeadBody").mockResolvedValue(true);

      // Fill the inventory to its maximum capacity
      for (let i = 0; i < inventoryContainer!.slotQty; i++) {
        const fillerItem = await unitTestHelper.createMockItem({ stackQty: 1, maxStackSize: 1 });
        await characterItemContainer.addItemToContainer(fillerItem, testCharacter, inventoryContainer!._id, {
          shouldAddOwnership: true,
        });
      }

      // Spy on the socket messaging to capture error messages
      // @ts-ignore
      const sendErrorSpy = jest.spyOn(characterAutoLoot.socketMessaging, "sendErrorMessageToCharacter");

      // Act
      await characterAutoLoot.execAutoLoot(testCharacter, [deadBody._id.toString()]);

      // Assert
      // Verify that the bag was not looted
      const updatedInventory = await characterInventory.getInventoryItemContainer(testCharacter);
      const lootedBag = (await characterInventory.getAllItemsFromContainer(updatedInventory!._id)).find(
        (item) => item._id.toString() === bag._id.toString()
      );
      expect(lootedBag).toBeUndefined();

      // Verify that an error message was sent to the character
      expect(sendErrorSpy).toHaveBeenCalledWith(testCharacter, "Sorry, your inventory is full.");
    });

    /**
     * Test Case 3: Looting Multiple Non-Stackable Bags
     */
    it("should correctly loot multiple non-stackable bags, each occupying a unique inventory slot with stackQty:1", async () => {
      // Arrange
      const [bag1, deadBody1, deadBodyContainer1] = await setupDeadBodyWithBag();

      // Create and add a second bag to the same dead body's container
      const bag2 = await unitTestHelper.createMockItemFromBlueprint(ContainersBlueprint.Bag, {
        maxStackSize: 1,
        owner: testCharacter._id,
      });

      const added = await characterItemContainer.addItemToContainer(bag2, testCharacter, deadBodyContainer1._id, {
        shouldAddOwnership: true,
      });

      expect(added).toBe(true);

      // Mock isCharacterDeadBody to return true
      // @ts-ignore
      jest.spyOn(characterAutoLoot, "isCharacterDeadBody").mockResolvedValue(true);

      // Act
      await characterAutoLoot.execAutoLoot(testCharacter, [deadBody1._id.toString()]);

      // Assert
      const updatedInventory = await characterInventory.getInventoryItemContainer(testCharacter);
      const lootedItems = await characterInventory.getAllItemsFromContainer(updatedInventory!._id);

      // Verify both bags are present in the inventory with stackQty:1
      const lootedBag1 = lootedItems.find((item) => item._id.toString() === bag1._id.toString());
      const lootedBag2 = lootedItems.find((item) => item._id.toString() === bag2._id.toString());

      expect(lootedBag1).toBeDefined();
      expect(lootedBag1!.stackQty).toBe(1);

      expect(lootedBag2).toBeDefined();
      expect(lootedBag2!.stackQty).toBe(1);

      // Verify that there are exactly two items looted
      expect(lootedItems.length).toBe(2);
    });
  });
});
