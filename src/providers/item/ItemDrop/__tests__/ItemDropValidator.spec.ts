import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
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
});
