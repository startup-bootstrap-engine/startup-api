import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { container, unitTestHelper } from "@providers/inversify/container";
import { IItemContainer, IItemDrop } from "@rpg-engine/shared";
import { ItemDropValidator } from "../ItemDropValidator";

describe("ItemDropValidator", () => {
  let testCharacter: ICharacter;
  let itemDropValidator: ItemDropValidator;
  let testItem: IItem;
  let socketMessagingSpy: jest.SpyInstance;
  let characterInventory: CharacterInventory;
  let inventory: IItem;
  let inventoryContainer: IItemContainer;
  let itemDropData: IItemDrop;
  let characterItemContainer: CharacterItemContainer;

  beforeAll(() => {
    itemDropValidator = container.get<ItemDropValidator>(ItemDropValidator);
    characterInventory = container.get<CharacterInventory>(CharacterInventory);
    characterItemContainer = container.get<CharacterItemContainer>(CharacterItemContainer);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasInventory: true, hasEquipment: true });
    testItem = await unitTestHelper.createMockItem({ owner: testCharacter._id });
    inventory = (await characterInventory.getInventory(testCharacter)) as IItem;
    inventoryContainer = (await characterInventory.getInventoryItemContainer(
      testCharacter
    )) as unknown as IItemContainer;

    expect(inventory).toBeDefined();
    expect(inventoryContainer).toBeDefined();

    // @ts-ignore
    socketMessagingSpy = jest.spyOn(itemDropValidator.socketMessaging, "sendErrorMessageToCharacter");

    itemDropData = {
      itemId: testItem._id,
      source: "inventory",
      x: testCharacter.x,
      y: testCharacter.y,
      scene: testCharacter.scene,
      fromContainerId: inventoryContainer._id,
      toPosition: {
        x: testCharacter.x,
        y: testCharacter.y,
        scene: testCharacter.scene,
      },
    };

    await characterItemContainer.addItemToContainer(testItem, testCharacter, inventoryContainer._id);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully drop an item", async () => {
    const result = await itemDropValidator.isItemDropValid(itemDropData, testCharacter);

    expect(result).toBe(true);
  });

  it("should fail if the item does not exist", async () => {
    await Item.findByIdAndDelete(testItem._id);

    const result = await itemDropValidator.isItemDropValid(itemDropData, testCharacter);

    expect(result).toBe(false);
    expect(socketMessagingSpy).toHaveBeenCalledWith(testCharacter, "Sorry, this item is not accessible.");
  });

  it("should fail if the item does not belong to the character", async () => {
    const anotherCharacter = await unitTestHelper.createMockCharacter(null, { hasInventory: true });
    testItem.owner = anotherCharacter._id;
    await testItem.save();

    const result = await itemDropValidator.isItemDropValid(itemDropData, testCharacter);

    expect(result).toBe(false);
    expect(socketMessagingSpy).toHaveBeenCalledWith(testCharacter, "Sorry, you don't own this item.");
  });

  it("should fail if the character does not have a bag or backpack", async () => {
    jest.spyOn(CharacterInventory.prototype, "getInventory").mockResolvedValueOnce(null);

    const result = await itemDropValidator.isItemDropValid(itemDropData, testCharacter);

    expect(result).toBe(false);
    expect(socketMessagingSpy).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, you must have a bag or backpack to drop this item."
    );
  });

  it("should fail if the item is not in the inventory container", async () => {
    jest.spyOn(ItemContainer, "findById").mockResolvedValueOnce(null);

    const result = await itemDropValidator.isItemDropValid(itemDropData, testCharacter);

    expect(result).toBe(false);
    expect(socketMessagingSpy).toHaveBeenCalledWith(testCharacter, "Sorry, inventory container not found.");
  });

  it("should fail if the item does not belong to the inventory container", async () => {
    itemDropData.fromContainerId = "invalidContainerId";

    const result = await itemDropValidator.isItemDropValid(itemDropData, testCharacter);

    expect(result).toBe(false);
    expect(socketMessagingSpy).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, this item does not belong to your inventory."
    );
  });

  it("should fail if basic validation on the character fails", async () => {
    // @ts-ignore
    jest.spyOn(itemDropValidator.characterValidation, "hasBasicValidation").mockReturnValueOnce(false);

    const result = await itemDropValidator.isItemDropValid(itemDropData, testCharacter);

    expect(result).toBe(false);
  });
});
