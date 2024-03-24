import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItemContainer as IItemContainerModel, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { container, unitTestHelper } from "@providers/inversify/container";
import { itemMock } from "@providers/unitTests/mock/itemMock";

import { IItemContainer } from "@rpg-engine/shared";
import { DepositItem } from "../DepositItem";
import { WithdrawItem } from "../WithdrawItem";

describe("WithdrawItem.ts", () => {
  let withdrawItem: WithdrawItem,
    testNPC: INPC,
    testCharacter: ICharacter,
    testItem: IItem,
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
    testItem = await unitTestHelper.createMockItem();

    // Deposit item into character's container
    depotContainer = (await depositItem.deposit(testCharacter, {
      itemId: testItem.id,
      npcId: testNPC.id,
    })) as unknown as IItemContainer;

    const characterEquipment = (await Equipment.findById(testCharacter.equipment)
      .populate("inventory")
      .exec()) as IEquipment;
    characterBackpack = characterEquipment.inventory as unknown as IItem;
  });

  it("withdraw item from depot", async () => {
    const characterItemContainer = await ItemContainer.findById(characterBackpack.itemContainer!);
    // check that character's item container does NOT have the item stored on depot
    const foundItem = await characterItemSlots.findItemOnSlots(
      characterItemContainer as IItemContainerModel,
      testItem.id!
    );
    expect(foundItem).toBeUndefined();

    const result = (await withdrawItem.withdraw(testCharacter, {
      itemId: testItem.id,
      npcId: testNPC.id,
      toContainerId: characterItemContainer!.id,
    })) as unknown as IItemContainer;

    expect(result).toBeTruthy();
  });

  describe("Edge cases", () => {
    let sendEventToUserSpy: jest.SpyInstance;

    beforeEach(() => {
      // @ts-ignore
      sendEventToUserSpy = jest.spyOn(withdrawItem.socketMessaging, "sendErrorMessageToCharacter");
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should not withdraw from deposit if item does not exist on origin container", async () => {
      const result = await withdrawItem.withdraw(testCharacter, {
        itemId: "fake-item-id",
        npcId: testNPC.id,
        toContainerId: characterBackpack!.itemContainer?.toString()!,
      });

      expect(result).toBeFalsy();

      expect(sendEventToUserSpy).toHaveBeenCalledWith(testCharacter, "Sorry, item not found.");
    });

    it("should not withdraw from deposit if destination container if full", async () => {
      const characterItemContainer = await ItemContainer.findById(characterBackpack.itemContainer!);

      if (!characterItemContainer) {
        throw new Error(
          "WithdrawItem.spec.ts > should not withdraw from deposit if destination container if full > characterInventoryContainer not found"
        );
      }

      characterItemContainer.slots = Array(40).fill(itemMock);
      await characterItemContainer.save();

      expect(characterItemContainer.slotQty).toEqual(40);

      const result = await withdrawItem.withdraw(testCharacter, {
        itemId: testItem.id,
        npcId: testNPC.id,
        toContainerId: characterItemContainer._id,
      });

      expect(result).toBeFalsy();
    });
  });
});
