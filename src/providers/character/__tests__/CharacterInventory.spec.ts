import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { itemsBlueprintIndex } from "@providers/item/data";
import { ContainersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { Types } from "mongoose";
import { CharacterInventory } from "../CharacterInventory";

describe("CharacterInventory", () => {
  let testCharacter: ICharacter;
  let characterInventory: CharacterInventory;

  beforeAll(() => {
    characterInventory = container.get(CharacterInventory);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });
  });

  it("fetches the inventory of a character", async () => {
    const inventory = await characterInventory.getInventory(testCharacter);

    expect(inventory).toBeDefined();
    expect(inventory?.owner).toEqual(testCharacter._id);
    expect(inventory?.isItemContainer).toBeTruthy();
  });

  it("fetches all items from a character's container", async () => {
    const inventory = await characterInventory.getInventory(testCharacter);

    expect(inventory).toBeDefined();

    const items = await characterInventory.getAllItemsFromContainer(inventory?.itemContainer!);
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThanOrEqual(0);
  });

  it("fetches all items from a character's inventory", async () => {
    const mockSword = await unitTestHelper.createMockItem(itemsBlueprintIndex.sword);

    const inventory = await characterInventory.getInventory(testCharacter);

    if (!inventory) {
      throw new Error("Inventory not found");
    }
    const inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as IItemContainer;

    await unitTestHelper.addItemsToContainer(inventoryContainer, 10, [mockSword]);

    const items = (await characterInventory.getAllItemsFromInventory(testCharacter)) as Record<string, IItem[]>;
    expect(items).toBeDefined();
    expect(Object.keys(items).length).toBeGreaterThanOrEqual(0);
  });

  it("fetches items recursively", async () => {
    const inventory = await characterInventory.getInventory(testCharacter);

    expect(inventory).toBeDefined();

    const nestedInventoryAndItems: Record<string, IItem[]> = {};
    // @ts-ignore
    await characterInventory.getItemsRecursively(inventory?.itemContainer, nestedInventoryAndItems);
    expect(Object.keys(nestedInventoryAndItems).length).toBeGreaterThanOrEqual(0);
  });

  // New tests

  it("returns null when character has no equipment", async () => {
    testCharacter.equipment = null as any;
    const inventory = await characterInventory.getInventory(testCharacter);
    expect(inventory).toBeNull();
  });

  it("throws error when container is not found", async () => {
    const invalidContainerId = new Types.ObjectId();
    await expect(characterInventory.getAllItemsFromContainer(invalidContainerId)).rejects.toThrowError(
      `Container not found for itemContainerId: ${invalidContainerId}`
    );
  });

  it("returns null when character has no inventory in getAllItemsFromInventory", async () => {
    testCharacter.equipment = null as any;
    const items = await characterInventory.getAllItemsFromInventory(testCharacter);
    expect(items).toBeNull();
  });

  it("generates new inventory for a character", async () => {
    const equipment = await characterInventory.generateNewInventory(testCharacter, ContainersBlueprint.Backpack, false);
    expect(equipment).toBeDefined();
    expect(equipment.owner).toEqual(testCharacter._id);
    expect(equipment.inventory).toBeDefined();
  });

  it("sends inventory update event", async () => {
    // @ts-ignore
    const mockSendEventToUser = jest.spyOn(characterInventory.socketMessaging, "sendEventToUser");
    await characterInventory.sendInventoryUpdateEvent(testCharacter);
    expect(mockSendEventToUser).toHaveBeenCalled();
  });
});
