import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { container, inMemoryHashTable, unitTestHelper } from "@providers/inversify/container";
import { CharacterItemContainer } from "../characterItems/CharacterItemContainer";

describe("CharacterItemContainer.ts", () => {
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

  describe("Main Functionality", () => {
    describe("addItemToContainer", () => {
      it("should successfully add an item to the container", async () => {
        const testItem = await unitTestHelper.createMockItem();

        const result = await characterItemContainer.addItemToContainer(testItem, testCharacter, inventoryContainer._id);

        expect(result).toBeTruthy();

        const updatedContainer = (await ItemContainer.findById(inventoryContainer._id)) as unknown as IItemContainer;

        expect(updatedContainer.slots[0]?._id).toStrictEqual(testItem._id);
      });

      it("should not add an item to a full container", async () => {
        await ItemContainer.findByIdAndUpdate(inventoryContainer._id, {
          $set: {
            slots: Array(inventoryContainer.slotQty).fill({ _id: "test" }),
          },
        });

        const newItem = await unitTestHelper.createMockItem();
        const result = await characterItemContainer.addItemToContainer(newItem, testCharacter, inventoryContainer._id);

        expect(result).toBeFalsy();
      });

      it("should stack items with maxStackSize > 1", async () => {
        const stackableItem1 = await unitTestHelper.createMockItem({ maxStackSize: 5, stackQty: 2 });
        const stackableItem2 = await unitTestHelper.createMockItem({ maxStackSize: 5, stackQty: 3 });

        await characterItemContainer.addItemToContainer(stackableItem1, testCharacter, inventoryContainer._id);
        const result = await characterItemContainer.addItemToContainer(
          stackableItem2,
          testCharacter,
          inventoryContainer._id
        );

        expect(result).toBeTruthy();

        const updatedContainer = (await ItemContainer.findById(inventoryContainer._id)) as unknown as IItemContainer;
        expect(updatedContainer.slots[0].stackQty).toBe(5);
      });

      it("should generate item container for items with isItemContainer=true", async () => {
        const containerItem = await unitTestHelper.createMockItem({ isItemContainer: true });

        const result = await characterItemContainer.addItemToContainer(
          containerItem,
          testCharacter,
          inventoryContainer._id
        );

        expect(result).toBeTruthy();
        const updatedItem = (await Item.findById(containerItem._id)) as unknown as IItem;
        expect(updatedItem.itemContainer).toBeDefined();
      });
    });

    describe("removeItemFromContainer", () => {
      it("should successfully remove an item from a container", async () => {
        const testItem = await unitTestHelper.createMockItem();

        await unitTestHelper.addItemsToContainer(inventoryContainer, 10, [testItem]);

        expect(inventoryContainer.slots[0]._id).toEqual(testItem._id);

        await characterItemContainer.removeItemFromContainer(testItem, testCharacter, inventoryContainer);

        const updatedInventoryContainer = (await ItemContainer.findById(
          inventoryContainer.id
        )) as unknown as IItemContainer;

        expect(updatedInventoryContainer.slots[0]).toBeNull();
      });

      it("should return false when trying to remove from an invalid container", async () => {
        const testItem = await unitTestHelper.createMockItem();
        const invalidContainer = {} as IItemContainer;

        const result = await characterItemContainer.removeItemFromContainer(testItem, testCharacter, invalidContainer);

        expect(result).toBeFalsy();
      });

      it("should update item isInContainer status after removal", async () => {
        const testItem = await unitTestHelper.createMockItem();
        await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [testItem]);

        await characterItemContainer.removeItemFromContainer(testItem, testCharacter, inventoryContainer);

        const updatedItem = (await Item.findById(testItem._id)) as unknown as IItem;
        expect(updatedItem.isInContainer).toBeFalsy();
      });
    });

    describe("getInventoryItemContainer", () => {
      it("should return null for a character without an inventory", async () => {
        const characterWithoutInventory = await unitTestHelper.createMockCharacter(null, { hasInventory: false });

        const result = await characterItemContainer.getInventoryItemContainer(characterWithoutInventory);

        expect(result).toBeNull();
      });
    });
  });

  describe("Validation", () => {
    describe("addItemToContainer", () => {
      it("should return false if the character does not have an inventory container", async () => {
        const testItem = await unitTestHelper.createMockItem();

        const result = await characterItemContainer.addItemToContainer(testItem, testCharacter, "invalid-container-id");

        expect(result).toBeFalsy();
      });
    });

    describe("removeItemFromContainer", () => {
      it("should return false if trying to remove an item that does not exist in the container", async () => {
        const nonExistentItem = await unitTestHelper.createMockItem();

        const result = await characterItemContainer.removeItemFromContainer(
          nonExistentItem,
          testCharacter,
          inventoryContainer
        );

        expect(result).toBeFalsy();
      });
    });
  });
});
