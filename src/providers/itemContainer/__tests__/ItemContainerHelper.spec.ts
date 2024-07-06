import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { container, unitTestHelper } from "@providers/inversify/container";
import { itemsBlueprintIndex } from "@providers/item/data/index";
import { BodiesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IItemContainer, ItemContainerType } from "@rpg-engine/shared";
import mongoose from "mongoose";
import { ItemContainerHelper } from "../ItemContainerHelper";

describe("ItemContainerHelper", () => {
  let itemContainerHelper: ItemContainerHelper;
  let testCharacter: ICharacter;
  let inventory: IItem;
  let characterItemContainer: CharacterItemContainer;
  let inventoryContainer: IItemContainer;
  let characterInventory: CharacterInventory;

  beforeAll(() => {
    itemContainerHelper = container.get<ItemContainerHelper>(ItemContainerHelper);
    characterItemContainer = container.get<CharacterItemContainer>(CharacterItemContainer);
    characterInventory = container.get<CharacterInventory>(CharacterInventory);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter({}, { hasEquipment: true, hasInventory: true });
    inventory = await testCharacter.inventory;

    inventoryContainer = (await characterInventory.getInventoryItemContainer(
      testCharacter
    )) as unknown as IItemContainer;

    jest.clearAllMocks();
  });

  describe("itemContainer type detection", () => {
    it("should properly detect an inventory itemContainer", async () => {
      const itemContainer = { parentItem: inventory.id } as IItemContainer;
      const result = await itemContainerHelper.getContainerType(itemContainer);
      expect(result).toBe(ItemContainerType.Inventory);
    });

    it("should properly detect a loot itemContainer", async () => {
      const blueprintData = itemsBlueprintIndex[BodiesBlueprint.CharacterBody];

      const charBody = await Item.create({
        ...blueprintData,
        owner: testCharacter.id,
        name: `${testCharacter.name}'s body`,
        scene: testCharacter.scene,
        x: testCharacter.x,
        y: testCharacter.y,
        generateContainerSlots: 20,
        isItemContainer: true,
      });

      const lootContainer = await ItemContainer.create({
        parentItem: charBody.id,
      });

      const type = await itemContainerHelper.getContainerType(lootContainer as unknown as IItemContainer);

      expect(type).toBe(ItemContainerType.Loot);
    });

    it("should properly detect a map-container itemContainer type", async () => {
      const mockItem = await unitTestHelper.createMockItem({
        x: testCharacter.x,
        y: testCharacter.y,
        scene: testCharacter.scene,
      });

      const mapContainer = new ItemContainer({
        parentItem: mockItem.id,
      });
      await mapContainer.save();

      const type = await itemContainerHelper.getContainerType(mapContainer as unknown as IItemContainer);

      expect(type).toBe(ItemContainerType.MapContainer);
    });

    it("should return undefined when item not found", async () => {
      const itemContainer = { parentItem: new mongoose.Types.ObjectId() } as IItemContainer;
      const result = await itemContainerHelper.getContainerType(itemContainer);
      expect(result).toBeUndefined();
    });
  });

  describe("execFnInAllItemContainerSlots", () => {
    it("should handle empty slots gracefully", async () => {
      const itemContainer: IItemContainer = {
        slots: {
          0: null,
          1: null,
        },
      } as unknown as IItemContainer;

      const fn = jest.fn().mockResolvedValue(undefined);
      await itemContainerHelper.execFnInAllItemContainerSlots(itemContainer, fn);

      expect(fn).not.toHaveBeenCalled();
    });

    it("should avoid recursion", async () => {
      const testItem1 = await unitTestHelper.createMockItem();
      const testItem2 = await unitTestHelper.createMockItem();

      await characterItemContainer.addItemToContainer(testItem1, testCharacter, inventoryContainer._id);
      await characterItemContainer.addItemToContainer(testItem2, testCharacter, inventoryContainer._id);

      inventoryContainer = (await ItemContainer.findById(
        inventoryContainer._id
      ).lean<IItemContainer>()) as IItemContainer;

      const fn = jest.fn().mockResolvedValue(undefined);
      await itemContainerHelper.execFnInAllItemContainerSlots(inventoryContainer, fn);

      expect(fn).toHaveBeenCalledTimes(2); // Ensure it doesn't call more times due to recursion
    });
  });

  describe("generateItemContainerIfNotPresentOnItem", () => {
    it("should create item container if not present", async () => {
      const mockItem: IItem = {
        _id: new mongoose.Types.ObjectId(),
        name: "testItem",
        isItemContainer: true,
        owner: testCharacter.id,
      } as IItem;

      const result = await itemContainerHelper.generateItemContainerIfNotPresentOnItem(mockItem);

      expect(result).toBeDefined();
      expect(result?.parentItem).toBe(mockItem._id);
    });

    it("should not create item container if already present", async () => {
      const mockItem: IItem = {
        _id: new mongoose.Types.ObjectId(),
        name: "testItem",
        isItemContainer: true,
        owner: testCharacter.id,
      } as IItem;

      await ItemContainer.create({
        parentItem: mockItem._id,
      });

      const result = await itemContainerHelper.generateItemContainerIfNotPresentOnItem(mockItem);

      expect(result).toBeUndefined();
    });

    it("should not create item container if item is not a container", async () => {
      const mockItem: IItem = {
        _id: new mongoose.Types.ObjectId(),
        name: "testItem",
        isItemContainer: false,
        owner: testCharacter.id,
      } as IItem;

      const result = await itemContainerHelper.generateItemContainerIfNotPresentOnItem(mockItem);

      expect(result).toBeUndefined();
    });
  });
});
