import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ItemContainerTransactionQueue } from "../ItemContainerTransactionQueue";

describe("ItemContainerTransaction", () => {
  let originContainer: IItemContainer;
  let targetContainer: IItemContainer;
  let testCharacter: ICharacter;
  let testItem: IItem;
  let itemContainerTransaction: ItemContainerTransactionQueue;
  let characterItemContainer: CharacterItemContainer;
  let sendErrorMessageToCharacterSpy: jest.SpyInstance;

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

    sendErrorMessageToCharacterSpy = jest.spyOn(SocketMessaging.prototype, "sendErrorMessageToCharacter");
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Basic functionality", () => {
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

    it("should update character weight after successful transfer", async () => {
      const mockUpdateCharacterWeight = jest.fn();
      jest.spyOn(CharacterWeightQueue.prototype, "updateCharacterWeight").mockImplementation(mockUpdateCharacterWeight);

      const result = await itemContainerTransaction.transferToContainer(
        testItem,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result).toBe(true);
      expect(mockUpdateCharacterWeight).toHaveBeenCalledWith(testCharacter);
    });

    it("should not update character weight if option is set to false", async () => {
      const mockUpdateCharacterWeight = jest.fn();
      jest.spyOn(CharacterWeightQueue.prototype, "updateCharacterWeight").mockImplementation(mockUpdateCharacterWeight);

      const result = await itemContainerTransaction.transferToContainer(
        testItem,
        testCharacter,
        originContainer,
        targetContainer,
        { updateCharacterWeightAfterTransaction: false }
      );

      expect(result).toBe(true);
      expect(mockUpdateCharacterWeight).not.toHaveBeenCalled();
    });
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

    it("should fail transfer if character validation fails", async () => {
      jest.spyOn(CharacterValidation.prototype, "hasBasicValidation").mockReturnValue(false);

      const result = await itemContainerTransaction.transferToContainer(
        testItem,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result).toBe(false);
    });

    it("should fail transfer if origin container doesn't exist", async () => {
      // @ts-ignore
      jest.spyOn(ItemContainer, "exists").mockResolvedValueOnce(false);

      const result = await itemContainerTransaction.transferToContainer(
        testItem,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result).toBe(false);
    });

    it("should fail transfer if target container doesn't exist", async () => {
      // @ts-ignore
      jest.spyOn(ItemContainer, "exists").mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const result = await itemContainerTransaction.transferToContainer(
        testItem,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(result).toBe(false);
    });

    it("should send error message to character on failed transfer", async () => {
      const mockSendErrorMessage = jest.fn();
      jest.spyOn(SocketMessaging.prototype, "sendErrorMessageToCharacter").mockImplementation(mockSendErrorMessage);

      // @ts-ignore
      jest.spyOn(ItemContainer, "exists").mockResolvedValueOnce(false);

      await itemContainerTransaction.transferToContainer(testItem, testCharacter, originContainer, targetContainer);

      expect(mockSendErrorMessage).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, the origin container wasn't found for this owner."
      );
    });
  });

  describe("Rollback functionality", () => {
    it("should attempt rollback if removing from origin container fails", async () => {
      const removeItemFromContainerSpy = jest
        .spyOn(CharacterItemContainer.prototype, "removeItemFromContainer")
        .mockResolvedValue(false);

      const addItemToContainerSpy = jest
        .spyOn(CharacterItemContainer.prototype, "addItemToContainer")
        .mockResolvedValue(true);

      const result = await itemContainerTransaction.transferToContainer(
        testItem,
        testCharacter,
        originContainer,
        targetContainer
      );

      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Failed to remove original item from origin container."
      );

      expect(result).toBe(false);
      expect(removeItemFromContainerSpy).toHaveBeenCalledTimes(4);
      expect(addItemToContainerSpy).toHaveBeenCalledTimes(1);
    });

    it("should send error message if rollback fails", async () => {
      jest.spyOn(CharacterItemContainer.prototype, "removeItemFromContainer").mockResolvedValue(false);

      await itemContainerTransaction.transferToContainer(testItem, testCharacter, originContainer, targetContainer);

      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Failed to rollback item addition to target container. Please check your inventory."
      );
    });
  });

  describe("Concurrent transfers", () => {
    it("should handle concurrent transfers correctly", async () => {
      const item1 = await unitTestHelper.createMockItem();
      const item2 = await unitTestHelper.createMockItem();

      await characterItemContainer.addItemToContainer(item1, testCharacter, originContainer._id);
      await characterItemContainer.addItemToContainer(item2, testCharacter, originContainer._id);

      originContainer = await ItemContainer.findById(originContainer._id).lean();

      targetContainer = await ItemContainer.findById(targetContainer._id).lean();

      const transfer1 = itemContainerTransaction.transferToContainer(
        item1,
        testCharacter,
        originContainer,
        targetContainer
      );

      const transfer2 = itemContainerTransaction.transferToContainer(
        item2,
        testCharacter,
        originContainer,
        targetContainer
      );

      const [result1, result2] = await Promise.all([transfer1, transfer2]);

      expect(result1).toBe(true);
      expect(result2).toBe(false);

      const updatedTargetContainer = await ItemContainer.findById(targetContainer._id).lean();
      const updatedOriginContainer = await ItemContainer.findById(originContainer._id).lean();

      // Extract item IDs from slots key-value pairs
      const targetSlotsItemIds = Object.values(updatedTargetContainer?.slots || {}).map((item: any) =>
        item?._id?.toString()
      );
      const originSlotsItemIds = Object.values(updatedOriginContainer?.slots || {}).map((item: any) =>
        item?._id?.toString()
      );

      expect(targetSlotsItemIds).toContain(item1._id.toString());
      expect(originSlotsItemIds).toContain(item2._id.toString());
    });
  });
});
