import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemMove } from "@rpg-engine/shared";
import { ItemDragAndDropValidator } from "../ItemDragAndDropValidator";

describe("ItemDragAndDropValidator", () => {
  let itemDragAndDropValidator: ItemDragAndDropValidator;
  let itemMoveData: IItemMove;
  let testCharacter: ICharacter;
  let testItem: IItem;
  let characterInventory: CharacterInventory;
  let sendErrorMessageToCharacterSpy: jest.SpyInstance;
  let inventory: IItem;
  let inventoryContainer: IItemContainer;

  beforeAll(() => {
    itemDragAndDropValidator = container.get<ItemDragAndDropValidator>(ItemDragAndDropValidator);
    characterInventory = container.get<CharacterInventory>(CharacterInventory);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });
    testItem = await unitTestHelper.createMockItem();
    await testItem.save();

    inventory = (await characterInventory.getInventory(testCharacter)) as IItem;
    inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as IItemContainer;

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    if (!inventoryContainer) {
      throw new Error("Inventory container not found");
    }

    await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [testItem]);

    // Add this part to create a valid itemMoveData object
    itemMoveData = {
      from: {
        item: testItem as any,
        slotIndex: 0,
        source: "Inventory",
        containerId: inventoryContainer._id,
      },
      to: {
        item: null,
        slotIndex: 1,
        source: "Inventory",
        containerId: inventoryContainer._id,
      },
      quantity: 1,
    };

    // @ts-ignore
    sendErrorMessageToCharacterSpy = jest.spyOn(SocketMessaging.prototype, "sendErrorMessageToCharacter");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should validate the rarity of items before moving", async () => {
    const highRarityItem = await unitTestHelper.createMockItem({ rarity: "Rare" });
    const lowRarityItem = await unitTestHelper.createMockItem({ rarity: "Common" });
    await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [highRarityItem, lowRarityItem]);

    itemMoveData.from.item = highRarityItem as any;
    itemMoveData.to.item = lowRarityItem as any;

    const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter);
    expect(result).toBeFalsy();
    expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
      testCharacter,
      "Unable to move items with different rarities."
    );
  });

  it("should return false if the quantity to be moved is more than the available quantity", async () => {
    const stackableItem = await unitTestHelper.createStackableMockItem();

    const inventory = await characterInventory.getInventory(testCharacter);
    const inventoryContainer = await ItemContainer.findById(inventory?.itemContainer);

    if (!inventory || !inventoryContainer) {
      throw new Error("Inventory or inventory container not found");
    }

    await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [stackableItem]);

    itemMoveData.from.item = stackableItem as any;
    itemMoveData.from.containerId = inventoryContainer._id;
    itemMoveData.from.slotIndex = 0;
    itemMoveData.to.item = null;
    itemMoveData.to.containerId = inventoryContainer._id;
    itemMoveData.to.slotIndex = 1;
    itemMoveData.quantity = 2;

    const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter);

    expect(result).toBeFalsy();

    expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledTimes(1);

    expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, you can't move more than the available quantity."
    );
  });

  it("should return false if the source and target slots are the same", async () => {
    itemMoveData.to.slotIndex = itemMoveData.from.slotIndex; // Set the destination slot index to be the same as the source
    const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter);

    expect(result).toBeFalsy();
  });

  it("should return false if the target slot is occupied by a different item", async () => {
    const anotherTestItem = await unitTestHelper.createMockItem();
    await anotherTestItem.save();
    itemMoveData.to.item = anotherTestItem as any; // Change the item to a different item

    const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter);

    expect(result).toBeFalsy();
  });

  it("should return false if items are moved between different sources", async () => {
    itemMoveData.to.source = "Equipment"; // Change the destination source to make the move invalid
    const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter);

    expect(result).toBeFalsy();
  });

  it("should return true if item move is valid", async () => {
    const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter);
    expect(result).toBeTruthy();
  });
});
