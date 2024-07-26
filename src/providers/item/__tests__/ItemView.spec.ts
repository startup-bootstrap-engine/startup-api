import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterView } from "@providers/character/CharacterView";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { FromGridX, FromGridY, ViewSocketEvents } from "@rpg-engine/shared";
import { ItemView } from "../ItemView";

describe("ItemView.ts", () => {
  let testCharacter: ICharacter;
  let testItem: IItem;
  let itemView: ItemView;
  let spyWarnCharactersAboutItemRemovalInView: any;
  let characterView: CharacterView;

  beforeAll(() => {
    itemView = container.get<ItemView>(ItemView);

    spyWarnCharactersAboutItemRemovalInView = jest.spyOn(itemView, "warnCharactersAboutItemRemovalInView" as any);

    characterView = container.get<CharacterView>(CharacterView);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter({
      x: FromGridX(0),
      y: FromGridY(0),
    });
    testItem = await unitTestHelper.createMockItem({
      x: FromGridX(0),
      y: FromGridY(0),
      scene: testCharacter.scene,
      isItemContainer: true,
    });
  });

  it("should properly remove item x, y and scene after calling the method removeItemFromMap", async () => {
    await itemView.removeItemFromMap(testItem);

    const item = await Item.findById(testItem.id);

    if (!item) {
      throw new Error("Item not found.");
    }

    expect(spyWarnCharactersAboutItemRemovalInView).toHaveBeenCalled();

    expect(item.x).toBeUndefined();
    expect(item.y).toBeUndefined();
    expect(item.scene).toBeUndefined();
  });

  it("should get one item after calling the method getItemsInCharacterView", async () => {
    const items = await itemView.getItemsInCharacterView(testCharacter);

    expect(items).toBeDefined();
    expect(items.length).toBe(1);
    expect(items[0]._id.toString()).toBe(testItem._id.toString());
    expect(items[0].description).toBe(testItem.description);
  });

  it("should add item in character's view when calling warnCharacterAboutItemsInView and remove it when calling the method warnCharactersAboutItemRemovalInView", async () => {
    await itemView.warnCharacterAboutItemsInView(testCharacter);

    const hasItem = await characterView.hasElementOnView(testCharacter, testItem._id, "items");

    expect(hasItem).toBeTruthy();

    await itemView.warnCharactersAboutItemRemovalInView(testItem, testItem.x!, testItem.y!, testItem.scene!);

    const character = await Character.findById(testCharacter._id);

    if (!character) throw new Error("Character not found.");

    const hasntItem = await characterView.hasElementOnView(character, testItem._id, "items");

    expect(hasntItem).toBeFalsy();
  });

  it("should throw error if we try to remove an item from a map without a scene", async () => {
    try {
      testItem.scene = undefined;
      await itemView.removeItemFromMap(testItem);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty("message", "You cannot call this method without an item x, y and scene.");
    }
  });

  it("should add item to map with correct x, y, and scene coordinates", async () => {
    const newItem = await unitTestHelper.createMockItem();
    await itemView.addItemToMap(newItem, FromGridX(1), FromGridY(1), "testScene");

    const updatedItem = await Item.findById(newItem._id);

    expect(updatedItem).toBeDefined();
    expect(updatedItem!.x).toBe(FromGridX(1));
    expect(updatedItem!.y).toBe(FromGridY(1));
    expect(updatedItem!.scene).toBe("testScene");
  });

  it("should throw error if x, y, or scene is undefined in addItemToMap", async () => {
    const newItem = await unitTestHelper.createMockItem();
    await expect(itemView.addItemToMap(newItem, undefined as any, FromGridY(1), "testScene")).rejects.toThrow(
      "You cannot call this method without an item x, y and scene."
    );
    await expect(itemView.addItemToMap(newItem, FromGridX(1), undefined as any, "testScene")).rejects.toThrow(
      "You cannot call this method without an item x, y and scene."
    );
    await expect(itemView.addItemToMap(newItem, FromGridX(1), FromGridY(1), undefined as any)).rejects.toThrow(
      "You cannot call this method without an item x, y and scene."
    );
  });

  it("should send event to characters about item removal in warnCharactersAboutItemRemovalInView", async () => {
    const spySendEventToUser = jest.spyOn(SocketMessaging.prototype, "sendEventToUser");

    // Mocking the getCharactersAroundXYPosition method to return a mock character
    const mockCharacters = [testCharacter];
    jest.spyOn(characterView, "getCharactersAroundXYPosition").mockResolvedValue(mockCharacters);

    await itemView.warnCharactersAboutItemRemovalInView(testItem, testItem.x!, testItem.y!, testItem.scene!);

    mockCharacters.forEach((character) => {
      expect(spySendEventToUser).toHaveBeenCalledWith(
        character.channelId!,
        ViewSocketEvents.Destroy,
        expect.objectContaining({ id: testItem._id, type: "items" })
      );
    });
  });

  it("should throw error if x, y, or scene is undefined in warnCharactersAboutItemRemovalInView", async () => {
    await expect(
      itemView.warnCharactersAboutItemRemovalInView(testItem, undefined as any, testItem.y!, testItem.scene!)
    ).rejects.toThrow("You cannot call this method without x, y and scene");
    await expect(
      itemView.warnCharactersAboutItemRemovalInView(testItem, testItem.x!, undefined as any, testItem.scene!)
    ).rejects.toThrow("You cannot call this method without x, y and scene");
    await expect(
      itemView.warnCharactersAboutItemRemovalInView(testItem, testItem.x!, testItem.y!, undefined as any)
    ).rejects.toThrow("You cannot call this method without x, y and scene");
  });
});
