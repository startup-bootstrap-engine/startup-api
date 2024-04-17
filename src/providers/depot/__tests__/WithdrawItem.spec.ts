import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";

import { IDepot } from "@entities/ModuleDepot/DepotModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { WithdrawItem } from "../WithdrawItem";

describe("WithdrawItem.ts", () => {
  let withdrawItem: WithdrawItem;
  let testCharacter: ICharacter;
  let testItem: IItem;
  let testNPC: INPC;
  let inventoryContainer: IItemContainer;
  let testDepot: IDepot;
  let depotItemContainerId: string;
  let characterInventory: CharacterInventory;
  let characterItemContainer: CharacterItemContainer;

  beforeAll(() => {
    withdrawItem = container.get(WithdrawItem);
    characterInventory = container.get(CharacterInventory);
    characterItemContainer = container.get(CharacterItemContainer);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });
    testItem = await unitTestHelper.createMockItem();
    testNPC = await unitTestHelper.createMockNPC();
    testDepot = await unitTestHelper.createMockDepot(testNPC, testCharacter._id);

    inventoryContainer = (await characterInventory.getInventoryItemContainer(testCharacter)) as IItemContainer;

    depotItemContainerId = testDepot.itemContainer?.toString()!;

    // add test item to depot, so we can withdraw
    await characterItemContainer.addItemToContainer(testItem, testCharacter, depotItemContainerId);
  });

  it("should successfully withdraw an item", async () => {
    const result = await withdrawItem.withdraw(testCharacter, {
      npcId: testNPC._id,
      itemId: testItem._id.toString(),
      toContainerId: inventoryContainer._id.toString(),
    });

    expect(result).toBe(true);
  });
});
