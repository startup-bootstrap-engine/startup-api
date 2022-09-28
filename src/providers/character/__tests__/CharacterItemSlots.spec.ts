/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { FromGridX, FromGridY } from "@rpg-engine/shared";
import { CharacterItemSlots } from "../characterItems/CharacterItemSlots";

describe("CharacterItemSlots.ts", () => {
  let characterItemSlots: CharacterItemSlots;
  let testItem: IItem;
  let inventory: IItem;
  let testCharacter: ICharacter;
  let inventoryItemContainerId: string;
  let inventoryContainer: IItemContainer;

  beforeAll(async () => {
    await unitTestHelper.beforeAllJestHook();

    characterItemSlots = container.get<CharacterItemSlots>(CharacterItemSlots);
  });

  beforeEach(async () => {
    await unitTestHelper.beforeEachJestHook(true);

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

    const result = await characterItemSlots.addItemOnFirstAvailableSlot(anotherStackableItem, inventoryContainer);

    console.log(result);

    console.log("inventoryContainer.slots", inventoryContainer.slots);
  });

  afterAll(async () => {
    await unitTestHelper.afterAllJestHook();
  });
});
