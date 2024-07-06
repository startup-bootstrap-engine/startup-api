/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { FromGridX, FromGridY, ItemRarities } from "@rpg-engine/shared";
import { CharacterItemSlots } from "../characterItems/CharacterItemSlots";

describe("CharacterItemSlots.ts", () => {
  let characterItemSlots: CharacterItemSlots;
  let testItem: IItem;
  let inventory: IItem;
  let testCharacter: ICharacter;
  let inventoryItemContainerId: string;
  let inventoryContainer: IItemContainer;

  beforeAll(() => {
    characterItemSlots = container.get<CharacterItemSlots>(CharacterItemSlots);
  });

  beforeEach(async () => {
    testCharacter = await (
      await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true, hasSkills: true })
    )
      .populate("skills")
      .execPopulate();
    testItem = await unitTestHelper.createMockItem();
    inventory = await testCharacter.inventory;
    inventoryItemContainerId = inventory.itemContainer as unknown as string;
    inventoryContainer = (await ItemContainer.findById(inventoryItemContainerId)) as unknown as IItemContainer;

    testCharacter.x = FromGridX(1);
    testCharacter.y = FromGridY(0);
    await testCharacter.save();
    await testItem.save();
  });

  describe("Quantity calculation", () => {
    it("should properly calculate qty of a NON-STACKABLE item", async () => {
      const firstItem = await unitTestHelper.createMockItem({
        rarity: ItemRarities.Legendary,
      });

      const secondItem = await unitTestHelper.createMockItem({
        rarity: ItemRarities.Rare,
      });

      inventoryContainer.slots = {
        ...inventoryContainer.slots,
        0: firstItem.toJSON({ virtuals: true }),
        1: secondItem.toJSON({ virtuals: true }),
      };
      await inventoryContainer.save();

      let qty = 0;
      if (firstItem.rarity) {
        qty = await characterItemSlots.getTotalQty(inventoryContainer, firstItem, firstItem.rarity);
        expect(qty).toBe(1);
      }

      if (secondItem.rarity) {
        qty = await characterItemSlots.getTotalQty(inventoryContainer, secondItem, secondItem.rarity);
        expect(qty).toBe(1);
      }
    });

    it("should properly calculate qty of a STACKABLE item", async () => {
      const firstItem = await unitTestHelper.createStackableMockItem({
        stackQty: 25,
        rarity: ItemRarities.Legendary,
      });
      const secondItem = await unitTestHelper.createStackableMockItem({
        stackQty: 25,
        rarity: ItemRarities.Common,
      });
      inventoryContainer.slots = {
        ...inventoryContainer.slots,
        0: firstItem.toJSON({ virtuals: true }),
        1: secondItem.toJSON({ virtuals: true }),
      };
      await inventoryContainer.save();

      let qty = 0;
      if (firstItem.rarity) {
        qty = await characterItemSlots.getTotalQty(inventoryContainer, firstItem, firstItem.rarity);

        expect(qty).toBe(25);
      }

      if (secondItem.rarity) {
        qty = await characterItemSlots.getTotalQty(inventoryContainer, secondItem, secondItem.rarity);

        expect(qty).toBe(25);
      }
    });
  });

  it("should get all items from a specific key", async () => {
    const firstItem = await unitTestHelper.createMockItem();
    const secondItem = await unitTestHelper.createMockItem();
    const thirdItem = await unitTestHelper.createMockItem({
      key: "different-item",
    });

    inventoryContainer.slots = {
      ...inventoryContainer.slots,
      0: firstItem.toJSON({ virtuals: true }),
      1: thirdItem.toJSON({ virtuals: true }),
      2: secondItem.toJSON({ virtuals: true }),
    };
    await inventoryContainer.save();

    const itemsSameKey = await characterItemSlots.getAllItemsFromKey(inventoryContainer, firstItem);

    expect(itemsSameKey.length).toBe(2);

    expect(itemsSameKey[0].key).toBe(firstItem.key);
    expect(itemsSameKey[1].key).toBe(secondItem.key);
  });

  it("should get different rarity items as separate slots", async () => {
    const firstItem = await unitTestHelper.createStackableMockItem({
      stackQty: 25,
      rarity: ItemRarities.Legendary,
    });
    const secondItem = await unitTestHelper.createStackableMockItem({
      stackQty: 25,
      rarity: ItemRarities.Common,
    });
    const thirdItem = await unitTestHelper.createStackableMockItem({
      stackQty: 25,
      rarity: ItemRarities.Rare,
    });
    inventoryContainer.slots = {
      ...inventoryContainer.slots,
      0: firstItem.toJSON({ virtuals: true }),
      1: secondItem.toJSON({ virtuals: true }),
    };
    await inventoryContainer.save();

    const itemsSameKeyFirstItem = await characterItemSlots.getAllItemsFromKey(inventoryContainer, firstItem);
    expect(itemsSameKeyFirstItem.length).toBe(1);

    const itemsSameKeyThirdItem = await characterItemSlots.getAllItemsFromKey(inventoryContainer, thirdItem);
    expect(itemsSameKeyThirdItem.length).toBe(0);
  });

  it("should properly find a specific item in a container slot", async () => {
    const firstItem = await unitTestHelper.createMockItem();

    inventoryContainer.slots = {
      ...inventoryContainer.slots,
      0: firstItem.toJSON({ virtuals: true }),
    };
    await inventoryContainer.save();

    const foundItem = await characterItemSlots.findItemOnSlots(inventoryContainer, firstItem.id);

    expect(foundItem).toBeDefined();

    expect(foundItem?._id).toEqual(firstItem._id);
  });

  it("should properly delete an item on a targeted slot", async () => {
    const firstItem = await unitTestHelper.createMockItem();

    inventoryContainer.slots = {
      ...inventoryContainer.slots,
      0: firstItem.toJSON({ virtuals: true }),
    };
    await inventoryContainer.save();

    const deleteItem = await characterItemSlots.deleteItemOnSlot(inventoryContainer, firstItem.id);

    expect(deleteItem).toBeTruthy();

    const foundItem = await characterItemSlots.findItemOnSlots(inventoryContainer, firstItem.id);

    expect(foundItem).toBeUndefined();
  });

  it("should find an item by slot index", async () => {
    const firstItem = await unitTestHelper.createMockItem();

    inventoryContainer.slots = {
      ...inventoryContainer.slots,
      5: firstItem.toJSON({ virtuals: true }),
    };
    await inventoryContainer.save();

    const slotIndex = await characterItemSlots.findItemSlotIndex(inventoryContainer, firstItem.id);

    expect(slotIndex).toEqual(5);
  });

  it("should find an item with the same key", async () => {
    const firstItem = await unitTestHelper.createMockItem();
    const secondItem = await unitTestHelper.createMockItem();

    inventoryContainer.slots = {
      ...inventoryContainer.slots,
      0: firstItem.toJSON({ virtuals: true }),
    };
    await inventoryContainer.save();

    const itemSameKey = await characterItemSlots.findItemWithSameKey(inventoryContainer, secondItem.key);

    expect(itemSameKey).toBeDefined();

    expect(itemSameKey?._id).toEqual(firstItem._id);
    expect(itemSameKey?.key).toEqual(secondItem.key);
  });

  it("should properly get the first available slot", async () => {
    inventoryContainer.slotQty = 1;
    inventoryContainer.slots = {
      0: undefined,
    };
    await inventoryContainer.save();

    const firstAvailableSlot = await characterItemSlots.getFirstAvailableSlotIndex(inventoryContainer);

    const firstItem = await unitTestHelper.createMockItem();

    expect(firstAvailableSlot).toBe(0);

    inventoryContainer.slotQty = 2;
    inventoryContainer.slots = {
      0: firstItem.toJSON({ virtuals: true }),
      1: undefined,
    };
    await inventoryContainer.save();

    const secondAvailableSlot = await characterItemSlots.getFirstAvailableSlotIndex(inventoryContainer);

    expect(secondAvailableSlot).toBe(1);

    const stackableItem = await unitTestHelper.createStackableMockItem({ stackQty: 1, maxStackSize: 2 });

    // check next available slot on half stack and full stack
    inventoryContainer.slotQty = 2;
    inventoryContainer.slots = {
      0: stackableItem.toJSON({ virtuals: true }),
      1: undefined,
    };
    await inventoryContainer.save();

    const halfStack = await characterItemSlots.getFirstAvailableSlotIndex(inventoryContainer, stackableItem);

    expect(halfStack).toBe(0);

    // check next available slot on half stack and full stack
    inventoryContainer.slotQty = 2;
    stackableItem.stackQty = 2;
    await stackableItem.save();
    inventoryContainer.slots = {
      0: stackableItem.toJSON({ virtuals: true }),
      1: undefined,
    };
    await inventoryContainer.save();

    const fullStackAvailableSlot = await characterItemSlots.getFirstAvailableSlotIndex(
      inventoryContainer,
      stackableItem
    );

    expect(fullStackAvailableSlot).toBe(1);
  });

  it("should properly get the first available slot for a stackable item with deferent rarity", async () => {
    const stackableItem1 = await unitTestHelper.createStackableMockItem({ stackQty: 1, maxStackSize: 10 });

    inventoryContainer.slotQty = 2;
    inventoryContainer.slots = {
      0: stackableItem1.toJSON({ virtuals: true }),
      1: undefined,
    };
    await inventoryContainer.save();

    const stackableItem2 = await unitTestHelper.createStackableMockItem({ stackQty: 1, maxStackSize: 10 });
    stackableItem2.rarity = ItemRarities.Rare;

    const fullStackAvailableSlot = await characterItemSlots.getFirstAvailableSlotIndex(
      inventoryContainer,
      stackableItem2
    );

    expect(fullStackAvailableSlot).toBe(1);
  });

  it("should properly check if there're available slots on a NON-STACKABLE item", async () => {
    const newItem = await unitTestHelper.createMockItem();
    const hasAvailableSlot = await characterItemSlots.hasAvailableSlot(inventoryItemContainerId, newItem);

    expect(hasAvailableSlot).toBeTruthy();
  });

  it("should properly check if there're available slots on a STACKABLE item", async () => {
    const stackableItem = await unitTestHelper.createStackableMockItem({
      stackQty: 7,
      maxStackSize: 10,
    });

    const inventoryContainer = (await ItemContainer.findById(inventoryItemContainerId)) as unknown as IItemContainer;

    if (!inventoryContainer) {
      throw new Error("Inventory container not found");
    }

    inventoryContainer.slotQty = 1;
    inventoryContainer.slots = {
      0: undefined,
    };
    await inventoryContainer.save();

    const hasAvailableSlot = await characterItemSlots.hasAvailableSlot(inventoryContainer.id, stackableItem);

    expect(hasAvailableSlot).toBeTruthy();

    inventoryContainer.slotQty = 1;
    inventoryContainer.slots = {
      0: stackableItem.toJSON({ virtuals: true }),
    };
    await inventoryContainer.save();

    const stackableItem2 = await unitTestHelper.createStackableMockItem({
      stackQty: 10,
      maxStackSize: 10,
    });
    const hasAvailableSlot2 = await characterItemSlots.hasAvailableSlot(inventoryContainer.id, stackableItem2);

    expect(hasAvailableSlot2).toBeFalsy();
  });

  it("should properly add item on first available slot", async () => {
    const stackableItem = await unitTestHelper.createStackableMockItem({
      stackQty: 9,
      maxStackSize: 10,
    });

    const inventoryContainer = (await ItemContainer.findById(inventoryItemContainerId)) as unknown as IItemContainer;

    inventoryContainer.slots = {
      0: stackableItem.toJSON({ virtuals: true }),
    };
    await inventoryContainer.save();

    if (!inventoryContainer) {
      throw new Error("Inventory container not found");
    }

    const anotherStackableItem = await unitTestHelper.createStackableMockItem({
      stackQty: 1,
      maxStackSize: 10,
    });

    const result = await characterItemSlots.tryAddingItemOnFirstSlot(
      testCharacter,
      anotherStackableItem,
      inventoryContainer
    );

    expect(result).toBeTruthy();
  });

  it("should not add a duplicate non-stackable item on slots", async () => {
    const nonStackableItem = await unitTestHelper.createMockItem({
      maxStackSize: 1,
    });

    inventoryContainer.slots = {
      0: nonStackableItem.toJSON({ virtuals: true }),
    };
    await inventoryContainer.save();

    const result = await characterItemSlots.tryAddingItemOnFirstSlot(
      testCharacter,
      nonStackableItem,
      inventoryContainer
    );

    expect(result).toBeFalsy();
  });

  describe("getTotalQtyByKey", () => {
    it("should correctly calculate total quantity for multiple items with the same key", async () => {
      const items: IItem[] = [
        await unitTestHelper.createStackableMockItem({ key: "item1", stackQty: 5 }),
        await unitTestHelper.createStackableMockItem({ key: "item1", stackQty: 3 }),
        await unitTestHelper.createStackableMockItem({ key: "item2", stackQty: 2 }),
      ];

      const result = characterItemSlots.getTotalQtyByKey(items);

      expect(result.get("item1")).toBe(8);
      expect(result.get("item2")).toBe(2);
    });

    it("should handle items without stackQty", async () => {
      const items: IItem[] = [
        await unitTestHelper.createMockItem({ key: "item1" }),
        await unitTestHelper.createMockItem({ key: "item1" }),
        await unitTestHelper.createMockItem({ key: "item2" }),
      ];

      const result = characterItemSlots.getTotalQtyByKey(items);

      expect(result.get("item1")).toBe(2);
      expect(result.get("item2")).toBe(1);
    });
  });

  describe("updateItemOnSlot", () => {
    it("should successfully update an item on a slot", async () => {
      const item = await unitTestHelper.createMockItem({ name: "Original Item" });
      inventoryContainer.slots = { 0: item.toJSON({ virtuals: true }) };
      await inventoryContainer.save();

      await characterItemSlots.updateItemOnSlot(0, inventoryContainer, { name: "Updated Item" });

      const updatedContainer = await ItemContainer.findById(inventoryContainer._id);
      expect(updatedContainer?.slots[0].name).toBe("Updated Item");
    });

    it("should throw an error when trying to update an item on an invalid slot", async () => {
      await expect(
        characterItemSlots.updateItemOnSlot(-1, inventoryContainer, { name: "Updated Item" })
      ).rejects.toThrow("Invalid slot index");
    });

    it("should throw an error when trying to update a non-existent item", async () => {
      inventoryContainer.slots = {};
      await inventoryContainer.save();

      await expect(
        characterItemSlots.updateItemOnSlot(0, inventoryContainer, { name: "Updated Item" })
      ).rejects.toThrow("No item found in the given slot");
    });
  });

  describe("getAvailableQuantityOnSlotToStack", () => {
    it("should return the correct available quantity for stacking", async () => {
      const item = await unitTestHelper.createStackableMockItem({
        key: "stackable-item",
        stackQty: 5,
        maxStackSize: 10,
      });
      inventoryContainer.slots = { 0: item.toJSON({ virtuals: true }) };
      await inventoryContainer.save();

      const availableQty = await characterItemSlots.getAvailableQuantityOnSlotToStack(
        inventoryContainer._id,
        "stackable-item",
        7
      );

      expect(availableQty).toBe(5); // 10 max - 5 current = 5 available
    });

    it("should return the input quantity if an empty slot is available", async () => {
      inventoryContainer.slots = { 0: null };
      await inventoryContainer.save();

      const availableQty = await characterItemSlots.getAvailableQuantityOnSlotToStack(
        inventoryContainer._id,
        "new-item",
        3
      );

      expect(availableQty).toBe(3);
    });

    it("should return 0 if no suitable slot is found", async () => {
      const item = await unitTestHelper.createStackableMockItem({
        key: "full-stack",
        stackQty: 10,
        maxStackSize: 10,
      });
      inventoryContainer.slots = { 0: item.toJSON({ virtuals: true }) };
      await inventoryContainer.save();

      const availableQty = await characterItemSlots.getAvailableQuantityOnSlotToStack(
        inventoryContainer._id,
        "full-stack",
        5
      );

      expect(availableQty).toBe(0);
    });
  });

  describe("tryAddingItemOnFirstSlot", () => {
    it("should add item to an empty slot when container is not full", async () => {
      const newItem = await unitTestHelper.createMockItem();
      inventoryContainer.slots = { 0: null, 1: null };
      await inventoryContainer.save();

      const result = await characterItemSlots.tryAddingItemOnFirstSlot(testCharacter, newItem, inventoryContainer);

      expect(result).toBeTruthy();
      const updatedContainer = await ItemContainer.findById(inventoryContainer._id);
      expect(updatedContainer?.slots[0]._id.toString()).toBe(newItem._id.toString());
    });

    it("should drop item on map when container is full and dropOnMapIfFull is true", async () => {
      const newItem = await unitTestHelper.createMockItem();
      inventoryContainer.slots = { 0: await unitTestHelper.createMockItem() };
      inventoryContainer.slotQty = 1;
      await inventoryContainer.save();

      const result = await characterItemSlots.tryAddingItemOnFirstSlot(
        testCharacter,
        newItem,
        inventoryContainer,
        true
      );

      expect(result).toBeTruthy();
      const updatedItem = await Item.findById(newItem._id);
      expect(updatedItem?.x).toBe(testCharacter.x);
      expect(updatedItem?.y).toBe(testCharacter.y);
      expect(updatedItem?.scene).toBe(testCharacter.scene);
    });
  });
});
