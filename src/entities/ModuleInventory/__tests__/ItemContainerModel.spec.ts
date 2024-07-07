/* eslint-disable no-unused-vars */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { container, inMemoryHashTable, unitTestHelper } from "@providers/inversify/container";
import { Types } from "mongoose";
import { IItemContainer, ItemContainer } from "../ItemContainerModel";
import { IItem, Item } from "../ItemModel";

describe("ItemContainer", () => {
  let testCharacter: ICharacter;
  let inventory: IItem;
  let inventoryContainer: IItemContainer;
  let characterItemContainer: CharacterItemContainer;

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });

    inventory = await testCharacter.inventory;
    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    characterItemContainer = container.get<CharacterItemContainer>(CharacterItemContainer);

    await inMemoryHashTable.delete("container-all-items", inventoryContainer._id.toString()!);
  });

  describe("Virtual Fields", () => {
    it("should correctly calculate itemIds", async () => {
      const items = await Promise.all([1, 2, 3].map(() => unitTestHelper.createMockItem()));
      await unitTestHelper.addItemsToContainer(inventoryContainer, 3, items);

      const updatedContainer = (await ItemContainer.findById(inventoryContainer._id)) as unknown as IItemContainer;
      expect(updatedContainer.itemIds.length).toBe(3);
      expect(updatedContainer.itemIds).toEqual(expect.arrayContaining(items.map((item) => item._id.toString())));
    });

    it("should correctly calculate totalItemsQty", async () => {
      const items = await Promise.all([1, 2, 3].map(() => unitTestHelper.createMockItem()));
      await unitTestHelper.addItemsToContainer(inventoryContainer, 3, items);

      const updatedContainer = (await ItemContainer.findById(inventoryContainer._id)) as unknown as IItemContainer;
      expect(updatedContainer.totalItemsQty).toBe(3);
    });

    it("should correctly calculate emptySlotsQty", async () => {
      const items = await Promise.all([1, 2].map(() => unitTestHelper.createMockItem()));
      await unitTestHelper.addItemsToContainer(inventoryContainer, 2, items);

      const updatedContainer = (await ItemContainer.findById(inventoryContainer._id)) as unknown as IItemContainer;
      expect(updatedContainer.emptySlotsQty).toBe(inventoryContainer.slotQty - 2);
    });

    it("should correctly determine if container isEmpty", async () => {
      expect(inventoryContainer.isEmpty).toBeTruthy();

      const testItem = await unitTestHelper.createMockItem();
      await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [testItem]);

      const updatedContainer = (await ItemContainer.findById(inventoryContainer._id)) as unknown as IItemContainer;
      expect(updatedContainer.isEmpty).toBeFalsy();
    });
  });

  describe("Hooks", () => {
    it("should initialize slots on save if not present", async () => {
      const newContainer = new ItemContainer({
        parentItem: Types.ObjectId(),
        slotQty: 5,
      });

      await newContainer.save();

      expect(newContainer.slots).toBeDefined();
      expect(Object.keys(newContainer.slots).length).toBe(5);
      expect(Object.values(newContainer.slots).every((slot) => slot === null)).toBeTruthy();
    });

    it("should update parent item on save", async () => {
      const parentItem = await unitTestHelper.createMockItem();
      const newContainer = new ItemContainer({
        parentItem: parentItem._id,
        slotQty: 5,
      });

      await newContainer.save();

      const updatedParentItem = await Item.findById(parentItem._id);
      expect(updatedParentItem?.isItemContainer).toBeTruthy();
      expect(updatedParentItem?.itemContainer?.toString()).toBe(newContainer._id.toString());
    });

    it("should remove associated items on container removal", async () => {
      const items = await Promise.all([1, 2, 3].map(() => unitTestHelper.createMockItem()));
      await unitTestHelper.addItemsToContainer(inventoryContainer, 3, items);

      await inventoryContainer.remove();

      for (const item of items) {
        const removedItem = await Item.findById(item._id);
        expect(removedItem).toBeNull();
      }
    });
  });
});
