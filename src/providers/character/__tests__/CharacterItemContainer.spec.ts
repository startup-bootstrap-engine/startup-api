import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
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

    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
  });

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

  it("should fail to add an item if the lock cannot be acquired", async () => {
    // @ts-ignore
    jest.spyOn(characterItemContainer.locker, "lock").mockResolvedValue(false);
    const testItem = await unitTestHelper.createMockItem();
    const result = await characterItemContainer.addItemToContainer(testItem, testCharacter, inventoryContainer._id);
    expect(result).toBeFalsy();
  });

  describe("Remove item from container", () => {
    it("should fail to remove an item that does not exist in the container", async () => {
      const testItem = await unitTestHelper.createMockItem();
      const result = await characterItemContainer.removeItemFromContainer(testItem, testCharacter, inventoryContainer);
      expect(result).toBeFalsy();
    });

    it("should fail to remove an item if the lock cannot be acquired", async () => {
      // @ts-ignore
      jest.spyOn(characterItemContainer.locker, "lock").mockResolvedValue(false);
      const testItem = await unitTestHelper.createMockItem();
      await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [testItem]);
      const result = await characterItemContainer.removeItemFromContainer(testItem, testCharacter, inventoryContainer);
      expect(result).toBeFalsy();
    });

    it("should remove an item from a specified slot correctly", async () => {
      const testItem = await unitTestHelper.createMockItem();
      await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [testItem]);
      await characterItemContainer.removeItemFromContainer(testItem, testCharacter, inventoryContainer);
      const updatedInventoryContainer = await ItemContainer.findById(inventoryContainer.id);
      // @ts-ignore
      expect(updatedInventoryContainer.slots[0]).toBeNull();
    });
  });
});
