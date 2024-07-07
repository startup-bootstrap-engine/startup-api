import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ContainersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
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
    testItem.owner = testCharacter._id;
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

  it("should return true if item move is valid", async () => {
    const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);
    expect(result).toBeTruthy();
  });

  describe("Edge cases", () => {
    it("should validate the rarity of items before moving", async () => {
      const highRarityItem = await unitTestHelper.createMockItem({ rarity: "Rare", owner: testCharacter._id });
      const lowRarityItem = await unitTestHelper.createMockItem({ rarity: "Common", owner: testCharacter._id });
      await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [highRarityItem, lowRarityItem]);

      itemMoveData.from.item = highRarityItem as any;
      itemMoveData.to.item = lowRarityItem as any;

      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);
      expect(result).toBeFalsy();
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Unable to move items with different rarities."
      );
    });

    it("should return false if the quantity to be moved is more than the available quantity", async () => {
      const stackableItem = await unitTestHelper.createStackableMockItem({ owner: testCharacter._id });

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

      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);

      expect(result).toBeFalsy();

      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledTimes(1);

      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you can't move more than the available quantity."
      );
    });

    it("should return false if the source and target slots are the same", async () => {
      itemMoveData.to.slotIndex = itemMoveData.from.slotIndex; // Set the destination slot index to be the same as the source
      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);

      expect(result).toBeFalsy();
    });

    it("should return false if the target slot is occupied by a different item", async () => {
      const anotherTestItem = await unitTestHelper.createMockItem();
      await anotherTestItem.save();
      itemMoveData.to.item = anotherTestItem as any; // Change the item to a different item

      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);

      expect(result).toBeFalsy();
    });

    it("should return false if items are moved between different sources", async () => {
      itemMoveData.to.source = "Equipment"; // Change the destination source to make the move invalid
      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);

      expect(result).toBeFalsy();
    });

    it("should return false if the item owner does not match the character", async () => {
      const anotherCharacter = await unitTestHelper.createMockCharacter(null, {
        hasEquipment: true,
        hasInventory: true,
        hasSkills: true,
      });
      itemMoveData.from.item.owner = anotherCharacter._id;

      await Item.updateOne({ _id: itemMoveData.from.item._id }, { owner: anotherCharacter._id });

      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);

      expect(result).toBeFalsy();
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(testCharacter, "Sorry, you don't own this item.");
    });

    it("should return false if the source item does not exist", async () => {
      await Item.deleteOne({ _id: itemMoveData.from.item._id }); // Delete the source item

      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);

      expect(result).toBeFalsy();
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, item to be moved wasn't found."
      );
    });

    it("should return false if a negative quantity is being moved", async () => {
      itemMoveData.quantity = -1; // Set the quantity to a negative value

      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);

      expect(result).toBeFalsy();
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you can't move negative quantities."
      );
    });

    it("should return false if there is no inventory for the character", async () => {
      jest.spyOn(CharacterInventory.prototype, "getInventory").mockResolvedValueOnce(null);

      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);

      expect(result).toBeFalsy();
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you must have a bag or backpack to move this item."
      );
    });

    it("should return false if there is no space in the target container", async () => {
      jest.spyOn(CharacterItemSlots.prototype, "hasAvailableSlot").mockResolvedValueOnce(false);

      const backpack = await unitTestHelper.createMockItemFromBlueprint(ContainersBlueprint.Backpack, {
        owner: testCharacter._id,
      });
      await backpack.save();

      itemMoveData.to.item = backpack as any;

      const result = await itemDragAndDropValidator.isItemMoveValid(itemMoveData, testCharacter, itemMoveData);

      expect(result).toBeFalsy();
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, there's no space in this container."
      );
    });
  });
});
