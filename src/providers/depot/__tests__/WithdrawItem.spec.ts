import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { Depot } from "@entities/ModuleDepot/DepotModel";
import { IItemContainer as IItemContainerModel, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { container, unitTestHelper } from "@providers/inversify/container";
import { itemMock } from "@providers/unitTests/mock/itemMock";

import { IItemContainer, UISocketEvents } from "@rpg-engine/shared";
import { Types } from "mongoose";
import { DepositItem } from "../DepositItem";
import { WithdrawItem } from "../WithdrawItem";

describe("WithdrawItem.ts", () => {
  let withdrawItem: WithdrawItem,
    testNPC: INPC,
    testCharacter: ICharacter,
    item: IItem,
    depositItem: DepositItem,
    depotContainer: IItemContainer,
    characterBackpack: IItem,
    characterItemSlots: CharacterItemSlots;

  beforeAll(() => {
    withdrawItem = container.get<WithdrawItem>(WithdrawItem);
    depositItem = container.get<DepositItem>(DepositItem);
    characterItemSlots = container.get<CharacterItemSlots>(CharacterItemSlots);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });
    testNPC = await unitTestHelper.createMockNPC();
    item = await unitTestHelper.createMockItem();

    // Deposit item into character's container
    depotContainer = (await depositItem.deposit(testCharacter, {
      itemId: item.id,
      npcId: testNPC.id,
    })) as IItemContainer;

    const characterEquipment = (await Equipment.findById(testCharacter.equipment)
      .populate("inventory")
      .exec()) as IEquipment;
    characterBackpack = characterEquipment.inventory as unknown as IItem;
  });

  it("withdraw item from depot", async () => {
    const characterItemContainer = await ItemContainer.findById(characterBackpack.itemContainer!);
    // check that character's item container does NOT have the item stored on depot
    let foundItem = await characterItemSlots.findItemOnSlots(characterItemContainer as IItemContainerModel, item.id!);
    expect(foundItem).toBeUndefined();

    depotContainer = (await withdrawItem.withdraw(testCharacter, {
      itemId: item.id,
      npcId: testNPC.id,
      toContainerId: characterItemContainer!.id,
    })) as IItemContainer;

    assertDepotContainer(depotContainer);

    // fetch the itemContainer from db and validate that changes persisted
    const updatedDepot = await Depot.findOne({
      owner: Types.ObjectId(testCharacter.id),
      key: testNPC.key,
    })
      .populate("itemContainer")
      .exec();

    expect(updatedDepot).toBeDefined();
    expect(depotContainer.parentItem).toEqual(updatedDepot!._id);

    const container = updatedDepot!.itemContainer as unknown as IItemContainer;
    assertDepotContainer(container);
    expect(depotContainer._id).toEqual(container._id);

    // check that character's item container does have the item stored on depot
    foundItem = await characterItemSlots.findItemOnSlots(characterItemContainer as IItemContainerModel, item.id!);
    expect(foundItem).toBeDefined();
    expect(foundItem?._id.toString()).toEqual(item.id);
    expect(foundItem?.type).toEqual(itemMock.type);
  });

  describe("Edge cases", () => {
    let sendEventToUserSpy: jest.SpyInstance;

    beforeEach(() => {
      // @ts-ignore
      sendEventToUserSpy = jest.spyOn(withdrawItem.socketMessaging, "sendEventToUser");
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should not withdraw item if isWithdrawValid returns false", async () => {
      // @ts-ignore
      jest.spyOn(withdrawItem, "isWithdrawValid").mockResolvedValue(false);

      const result = await withdrawItem.withdraw(testCharacter, {
        itemId: item.id,
        npcId: testNPC.id,
        toContainerId: characterBackpack.itemContainer?.toString()!,
      });

      expect(result).toBeUndefined();
    });

    it("should not withdraw from deposit if destination container if full", async () => {
      const characterInventoryContainer = await ItemContainer.findById(characterBackpack.itemContainer);

      if (!characterInventoryContainer) {
        throw new Error(
          "WithdrawItem.spec.ts > should not withdraw from deposit if destination container if full > characterInventoryContainer not found"
        );
      }

      characterInventoryContainer.slots = Array(40).fill(itemMock);
      await characterInventoryContainer.save();

      expect(characterInventoryContainer.slotQty).toEqual(40);

      const result = await withdrawItem.withdraw(testCharacter, {
        itemId: item.id,
        npcId: testNPC.id,
        toContainerId: characterInventoryContainer.id,
      });

      expect(result).toBeUndefined();

      expect(sendEventToUserSpy).toHaveBeenCalledWith(
        testCharacter.channelId!,
        UISocketEvents.ShowMessage,
        expect.objectContaining({
          message: expect.stringContaining("Sorry, destination container is full."),
        })
      );
    });
  });
});

function assertDepotContainer(depotContainer: IItemContainer): void {
  expect(depotContainer).toBeDefined();
  expect(depotContainer!.slotQty).toEqual(40);
  // container must contain the deposited item
  // all other slots should be empty
  for (const i in depotContainer!.slots) {
    expect(depotContainer!.slots[i]).toBeNull();
  }
}
