import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GemsBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { UseWithItemToItem } from "../abstractions/UseWithItemToItem";

describe("UseWithItemToItem", () => {
  let testCharacter: ICharacter;
  let testOriginItem: IItem;
  let testTargetItem: IItem;
  let useWithItemToItem: UseWithItemToItem;
  let characterItemContainer: CharacterItemContainer;
  let characterInventory: CharacterInventory;
  let inventoryItemContainer: IItemContainer;
  beforeAll(() => {
    useWithItemToItem = container.get(UseWithItemToItem);
    characterItemContainer = container.get(CharacterItemContainer);
    characterInventory = container.get(CharacterInventory);
  });

  const addOriginAndTargetItemsToInventory = async (): Promise<void> => {
    inventoryItemContainer = (await characterInventory.getInventoryItemContainer(testCharacter)) as IItemContainer;

    const addedOriginItem = await characterItemContainer.addItemToContainer(
      testOriginItem,
      testCharacter,
      inventoryItemContainer._id
    );

    const addedTargetItem = await characterItemContainer.addItemToContainer(
      testTargetItem,
      testCharacter,
      inventoryItemContainer._id
    );

    expect(addedOriginItem).toBeTruthy();
    expect(addedTargetItem).toBeTruthy();

    // refresh inventory container with added items
    inventoryItemContainer = (await characterInventory.getInventoryItemContainer(testCharacter)) as IItemContainer;
  };

  beforeEach(async () => {
    const characterPromise = unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
    });

    const originItemPromise = unitTestHelper.createMockItemFromBlueprint(GemsBlueprint.RubyGem);
    const targetItemPromise = unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.BroadSword);

    const [character, originItem, targetItem] = await Promise.all([
      characterPromise,
      originItemPromise,
      targetItemPromise,
    ]);

    testCharacter = character;
    testOriginItem = originItem;
    testTargetItem = targetItem;

    await addOriginAndTargetItemsToInventory();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should properly execute useWithItemToItem and call useWithItemEffect if validation passes", async () => {
    // @ts-ignore
    const useWithItemEffectSpy = jest.spyOn(useWithItemToItem, "fetchItemsAndExecuteEffect");

    await useWithItemToItem.execute(testCharacter, {
      originItemId: testOriginItem._id,
      targetItemId: testTargetItem._id,
    });

    expect(useWithItemEffectSpy).toHaveBeenCalled();
  });

  describe("Edge cases validation", () => {
    it("should not execute effect if origin item is not in inventory", async () => {
      const result = await characterItemContainer.removeItemFromContainer(
        testOriginItem,
        testCharacter,
        inventoryItemContainer
      );

      expect(result).toBeTruthy();

      const updatedInventoryContainer = await characterInventory.getInventoryItemContainer(testCharacter);

      expect(updatedInventoryContainer?.slots[0]).toBeNull();

      // @ts-ignore
      const spy = jest.spyOn(useWithItemToItem, "fetchItemsAndExecuteEffect");

      await useWithItemToItem.execute(testCharacter, {
        originItemId: testOriginItem._id,
        targetItemId: testTargetItem._id,
      });
      expect(spy).not.toHaveBeenCalled();
    });

    it("should not execute effect if target item is not in inventory", async () => {
      const result = await characterItemContainer.removeItemFromContainer(
        testTargetItem,
        testCharacter,
        inventoryItemContainer
      );

      expect(result).toBeTruthy();

      const updatedInventoryContainer = await characterInventory.getInventoryItemContainer(testCharacter);

      expect(updatedInventoryContainer?.slots[1]).toBeNull();

      // @ts-ignore
      const spy = jest.spyOn(useWithItemToItem, "fetchItemsAndExecuteEffect");

      await useWithItemToItem.execute(testCharacter, {
        originItemId: testOriginItem._id,
        targetItemId: testTargetItem._id,
      });
      expect(spy).not.toHaveBeenCalled();
    });

    it("should not execute effect if origin item blueprint is missing", async () => {
      // @ts-ignore
      const spy = jest.spyOn(useWithItemToItem, "fetchItemsAndExecuteEffect");

      // @ts-ignore
      jest.spyOn(useWithItemToItem.blueprintManager, "getBlueprint").mockResolvedValue(null);

      await useWithItemToItem.execute(testCharacter, {
        originItemId: testOriginItem._id,
        targetItemId: testTargetItem._id,
      });
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
