import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { container, unitTestHelper } from "@providers/inversify/container";
import { FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemContainerTransactionQueue } from "../ItemContainerTransactionQueue";

describe("ItemContainerTransaction", () => {
  let originContainer: IItemContainer;
  let targetContainer: IItemContainer;
  let testCharacter: ICharacter;
  let testItem: IItem;
  let itemContainerTransaction: ItemContainerTransactionQueue;
  let characterItemContainer: CharacterItemContainer;

  beforeAll(() => {
    itemContainerTransaction = container.resolve(ItemContainerTransactionQueue);
    characterItemContainer = container.get(CharacterItemContainer);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true });
    testItem = await unitTestHelper.createMockItem();
    originContainer = await unitTestHelper.createMockItemContainer({ owner: testCharacter._id });
    targetContainer = await unitTestHelper.createMockItemContainer({ owner: testCharacter._id });
    await characterItemContainer.addItemToContainer(testItem, testCharacter, originContainer._id);

    originContainer = (await ItemContainer.findById(originContainer._id)) as IItemContainer; // refresh container
  });

  it("should successfully transfer an item from a container to another", async () => {
    const result = await itemContainerTransaction.transferToContainer(
      testItem,
      testCharacter,
      originContainer,
      targetContainer
    );

    const updatedOriginContainer = await ItemContainer.findById(originContainer._id).lean();
    const updatedTargetContainer = await ItemContainer.findById(targetContainer._id).lean();

    expect(result).toBe(true);

    expect(updatedOriginContainer?.slots[0]).toBeNull();
    expect(updatedTargetContainer?.slots[0]._id).toStrictEqual(testItem._id);
  });

  describe("Edge cases", () => {
    it("should fail transfer if origin container does not contain the item", async () => {
      originContainer.slots[0] = null;
      await originContainer.save();

      const result = await itemContainerTransaction.transferToContainer(
        testItem,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result).toBe(false);
    });

    it("should fail transfer if the target container has no available slots", async () => {
      targetContainer.slots = Array(targetContainer.slotQty).fill({ _id: "test" });
      await targetContainer.save();

      const result = await itemContainerTransaction.transferToContainer(
        testItem,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result).toBe(false);
    });

    it("should rollback changes if adding to target container fails", async () => {
      // Simulating failure by mocking `addItemToContainer` method to always return false
      // @ts-ignore
      jest.spyOn(itemContainerTransaction.characterItemContainer, "addItemToContainer").mockResolvedValueOnce(false);

      const result = await itemContainerTransaction.transferToContainer(
        testItem,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result).toBe(false);

      // Verifying that the item is still in the origin container after rollback
      const updatedOriginContainer = await ItemContainer.findById(originContainer._id).lean();
      expect(updatedOriginContainer?.slots[0]._id).toStrictEqual(testItem._id);
    });

    it("should successfully transfer stackable items", async () => {
      const testStackableItem1 = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Apple, {
        stackQty: 10,
      });
      const testNonStackableItem = await unitTestHelper.createMockItem();
      const testStackableItem2 = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Watermelon, {
        stackQty: 10,
      });

      await characterItemContainer.addItemToContainer(testStackableItem1, testCharacter, originContainer._id);
      await characterItemContainer.addItemToContainer(testNonStackableItem, testCharacter, originContainer._id);
      await characterItemContainer.addItemToContainer(testStackableItem2, testCharacter, originContainer._id);

      originContainer = (await ItemContainer.findById(originContainer._id)) as IItemContainer; // refresh container

      const result = await itemContainerTransaction.transferToContainer(
        testStackableItem1,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result).toBe(true);

      const result2 = await itemContainerTransaction.transferToContainer(
        testNonStackableItem,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result2).toBe(true);

      const result3 = await itemContainerTransaction.transferToContainer(
        testStackableItem2,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result3).toBe(true);

      const updatedTargetContainer = await ItemContainer.findById(targetContainer._id).lean();

      expect(updatedTargetContainer?.slots[0]._id).toStrictEqual(testStackableItem1._id);
      expect(updatedTargetContainer?.slots[1]._id).toStrictEqual(testNonStackableItem._id);
      expect(updatedTargetContainer?.slots[2]._id).toStrictEqual(testStackableItem2._id);

      const updatedOriginContainer = await ItemContainer.findById(originContainer._id).lean();

      expect(updatedOriginContainer?.slots[1]).toBeNull();
    });
  });
});
