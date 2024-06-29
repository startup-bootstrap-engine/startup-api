/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
    originContainer = (await ItemContainer.findById(originContainer._id)) as IItemContainer;

    sendErrorMessageToCharacterSpy = jest.spyOn(SocketMessaging.prototype, "sendErrorMessageToCharacter");
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const transferItem = () =>
    itemContainerTransaction.transferToContainer(testItem, testCharacter, originContainer, targetContainer);

  describe("Basic functionality", () => {
    it("should successfully transfer an item between containers", async () => {
      const result = await transferItem();

      const [updatedOriginContainer, updatedTargetContainer] = await Promise.all([
        ItemContainer.findById(originContainer._id).lean(),
        ItemContainer.findById(targetContainer._id).lean(),
      ]);

      expect(result).toBe(true);
      expect(updatedOriginContainer?.slots[0]).toBeNull();
      expect(updatedTargetContainer?.slots[0]._id).toStrictEqual(testItem._id);
    });

    it("should update character weight after successful transfer", async () => {
      const mockUpdateCharacterWeight = jest.fn();
      jest.spyOn(CharacterWeightQueue.prototype, "updateCharacterWeight").mockImplementation(mockUpdateCharacterWeight);

      await transferItem();

      expect(mockUpdateCharacterWeight).toHaveBeenCalledWith(testCharacter);
    });

    it("should not update character weight if option is set to false", async () => {
      const mockUpdateCharacterWeight = jest.fn();
      jest.spyOn(CharacterWeightQueue.prototype, "updateCharacterWeight").mockImplementation(mockUpdateCharacterWeight);

      await itemContainerTransaction.transferToContainer(testItem, testCharacter, originContainer, targetContainer, {
        updateCharacterWeightAfterTransaction: false,
      });

      expect(mockUpdateCharacterWeight).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should fail transfer if origin container does not contain the item", async () => {
      originContainer.slots[0] = null;
      await originContainer.save();

      const result = await transferItem();

      expect(result).toBe(false);
    });

    it("should fail transfer if the target container has no available slots", async () => {
      targetContainer.slots = Array(targetContainer.slotQty).fill({ _id: "test" });
      await targetContainer.save();

      const result = await transferItem();

      expect(result).toBe(false);
    });

    it("should fail transfer if character validation fails", async () => {
      jest.spyOn(CharacterValidation.prototype, "hasBasicValidation").mockReturnValue(false);

      const result = await transferItem();

      expect(result).toBe(false);
    });

    it("should fail transfer if origin or target container doesn't exist", async () => {
      // @ts-ignore
      jest.spyOn(ItemContainer, "exists").mockResolvedValueOnce(false);

      const result = await transferItem();

      expect(result).toBe(false);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
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

      const result = await transferItem();

      expect(result).toBe(false);
      expect(removeItemFromContainerSpy).toHaveBeenCalledTimes(1);
      expect(addItemToContainerSpy).toHaveBeenCalledTimes(1);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Failed to remove original item from origin container."
      );
    });
  });

  describe("ItemContainerTransactionQueue - Rollback and Consistency", () => {
    it("should rollback when transaction is inconsistent", async () => {
      jest.spyOn(itemContainerTransaction as any, "performTransaction").mockResolvedValue(true);
      jest.spyOn(itemContainerTransaction as any, "wasTransactionConsistent").mockResolvedValue(false);
      const rollbackContainersSpy = jest
        .spyOn(itemContainerTransaction as any, "rollbackContainers")
        // @ts-ignore
        .mockResolvedValue();

      const result = await transferItem();

      expect(result).toBe(false);
      expect(rollbackContainersSpy).toHaveBeenCalled();
    });

    it("should not rollback when transaction is consistent", async () => {
      jest.spyOn(itemContainerTransaction as any, "performTransaction").mockResolvedValue(true);
      jest.spyOn(itemContainerTransaction as any, "wasTransactionConsistent").mockResolvedValue(true);
      const rollbackContainersSpy = jest
        .spyOn(itemContainerTransaction as any, "rollbackContainers")
        // @ts-ignore
        .mockResolvedValue();

      const result = await transferItem();

      expect(result).toBe(true);
      expect(rollbackContainersSpy).not.toHaveBeenCalled();
    });

    it("should detect inconsistent transaction", async () => {
      const mockContainers = {
        origin: { _id: "origin", slots: { 0: testItem } },
        target: { _id: "target", slots: { 0: null } },
      };

      jest.spyOn(ItemContainer, "findById").mockImplementation(
        (id) =>
          ({
            lean: () => Promise.resolve(mockContainers[id as keyof typeof mockContainers]),
          } as any)
      );

      const result = await (itemContainerTransaction as any).wasTransactionConsistent(
        testItem,
        { _id: "origin" },
        { _id: "target" }
      );

      expect(result).toBe(false);
    });

    it("should correctly take and apply container snapshots", async () => {
      const originalContainer = {
        _id: "container1",
        slots: { 0: testItem, 1: null },
      };

      const snapshot = (itemContainerTransaction as any).takeContainerSnapshot(originalContainer);

      expect(snapshot).toEqual({
        containerId: "container1",
        slots: { 0: testItem, 1: null },
      });

      const updateOneSpy = jest.spyOn(ItemContainer, "updateOne").mockResolvedValue({} as any);

      await (itemContainerTransaction as any).applyContainerSnapshot(snapshot);

      expect(updateOneSpy).toHaveBeenCalledWith({ _id: "container1" }, { $set: { slots: { 0: testItem, 1: null } } });
    });

    it("should handle failed add to target container", async () => {
      jest.spyOn(CharacterItemContainer.prototype, "addItemToContainer").mockResolvedValue(false);

      const result = await (itemContainerTransaction as any).performTransaction(
        testItem,
        testCharacter,
        originContainer,
        targetContainer,
        {}
      );

      expect(result).toBe(false);
    });

    it("should handle failed remove from origin container", async () => {
      jest.spyOn(CharacterItemContainer.prototype, "addItemToContainer").mockResolvedValue(true);
      jest.spyOn(CharacterItemContainer.prototype, "removeItemFromContainer").mockResolvedValue(false);

      const result = await (itemContainerTransaction as any).performTransaction(
        testItem,
        testCharacter,
        originContainer,
        targetContainer,
        {}
      );

      expect(result).toBe(false);
    });
  });
});
