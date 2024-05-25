/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";

import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { ItemPickup } from "@providers/item/ItemPickup/ItemPickup";
import { CharacterItemStack } from "../characterItems/CharacterItemStack";

describe("CharacterItemStack.ts", () => {
  let testItem: IItem;
  let testCharacter: ICharacter;
  let itemPickup: ItemPickup;
  let characterItemStack: CharacterItemStack;
  let inventory: IItem;
  let inventoryItemContainerId: string;

  beforeAll(() => {
    itemPickup = container.get<ItemPickup>(ItemPickup);
    characterItemStack = container.get<CharacterItemStack>(CharacterItemStack);
  });

  beforeEach(async () => {
    testCharacter = await (
      await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true, hasSkills: true })
    )
      .populate("skills")
      .execPopulate();
    testItem = await unitTestHelper.createStackableMockItem({
      x: testCharacter.x,
      y: testCharacter.y,
      scene: testCharacter.scene,
      weight: 0,
      stackQty: 25,
      maxStackSize: 100,
    });
    inventory = await testCharacter.inventory;
    inventoryItemContainerId = inventory.itemContainer as unknown as string;

    // add testItem to the inventory
    await pickupItem(testItem, inventoryItemContainerId);
  });

  const pickupItem = async (item: IItem, toContainerId: string, extraProps?: Record<string, unknown>) => {
    const itemAdded = await itemPickup.performItemPickup(
      {
        itemId: item.id,
        x: testCharacter.x,
        y: testCharacter.y,
        scene: testCharacter.scene,
        toContainerId,
        ...extraProps,
      },
      testCharacter
    );
    return itemAdded;
  };

  it("should add to stack if character has stackable item on its container, and we didn't reach the max stack size.", async () => {
    const newStackableItem = await unitTestHelper.createStackableMockItem({
      x: testCharacter.x,
      y: testCharacter.y,
      scene: testCharacter.scene,
      weight: 0,
      stackQty: 25,
      maxStackSize: 100,
    });

    const itemAdded = await pickupItem(newStackableItem, inventoryItemContainerId);

    expect(itemAdded).toBe(true);

    const updatedInventoryContainer = await ItemContainer.findById(inventoryItemContainerId);

    const stackedItem = updatedInventoryContainer?.slots[0];

    expect(stackedItem.stackQty).toBe(50);
  });

  it("should increase stack size to max, and create a new item with the difference if character has stackable item on its container, and we reached the max stack size.", async () => {
    const newStackableItem = await unitTestHelper.createStackableMockItem({
      x: testCharacter.x,
      y: testCharacter.y,
      scene: testCharacter.scene,
      weight: 0,
      stackQty: 85,
      maxStackSize: 100,
    });
    const itemAdded = await pickupItem(newStackableItem, inventoryItemContainerId);

    expect(itemAdded).toBe(true); // we're adding a new item here! The stack should be maxed and the new one created as new item

    const updatedInventoryContainer = await ItemContainer.findById(inventoryItemContainerId);

    const firstSlotItem = updatedInventoryContainer?.slots[0];
    const secondSlotItem = updatedInventoryContainer?.slots[1];

    expect(firstSlotItem.stackQty).toBe(100);
    expect(secondSlotItem.stackQty).toBe(10);
  });

  it("should create a new item on target container, if no similar stackable item is found on it.", async () => {
    const newStackableItem = await unitTestHelper.createStackableMockItem({
      x: testCharacter.x,
      y: testCharacter.y,
      scene: testCharacter.scene,
      weight: 0,
      stackQty: 25,
      maxStackSize: 100,
    });

    // erase first item on inventoryContainer
    await ItemContainer.updateOne(
      {
        _id: inventoryItemContainerId,
      },
      {
        $set: {
          slots: {
            0: null,
          },
        },
      }
    );

    const itemAdded = await pickupItem(newStackableItem, inventoryItemContainerId);

    const updatedInventoryContainer = await ItemContainer.findById(inventoryItemContainerId);

    expect(itemAdded).toBe(true); // no stackable item on the target container, so it should create a new one.

    const itemFirstSlot = updatedInventoryContainer?.slots[0];

    expect(itemFirstSlot.stackQty).toBe(25);
  });

  it("should return false and not add item if container has no slots.", async () => {
    const newStackableItem = await unitTestHelper.createStackableMockItem({
      x: testCharacter.x,
      y: testCharacter.y,
      scene: testCharacter.scene,
      weight: 0,
      stackQty: 25,
      maxStackSize: 100,
    });

    // create a container with no slots
    const emptyContainer = await unitTestHelper.createMockItemContainer({
      slots: [],
      slotQty: 0,
    });

    const result = await characterItemStack.tryAddingItemToStack(testCharacter, emptyContainer, newStackableItem);

    expect(result).toBe(false);
  });

  it("should return false if item is a duplicate of an existing item.", async () => {
    testItem.maxStackSize = 30;

    const duplicateItem = testItem;

    const inventoryItemContainer = await ItemContainer.findById(inventoryItemContainerId).lean<IItemContainer>();

    const result = await characterItemStack.tryAddingItemToStack(testCharacter, inventoryItemContainer, duplicateItem);

    expect(result).toBe(false);
  });
});
