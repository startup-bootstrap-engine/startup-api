import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { container, unitTestHelper } from "@providers/inversify/container";
import { DepositItem } from "../DepositItem";

describe("DepositItem.ts", () => {
  let depositItem: DepositItem,
    testNPC: INPC,
    testCharacter: ICharacter,
    testItem: IItem,
    characterItemContainer: CharacterItemContainer,
    inventory: IItem,
    inventoryItemContainer: IItemContainer,
    characterInventory: CharacterInventory;

  beforeAll(() => {
    depositItem = container.get(DepositItem);
    characterItemContainer = container.get(CharacterItemContainer);
    characterInventory = container.get(CharacterInventory);
    characterItemContainer = container.get(CharacterItemContainer);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });
    testNPC = await unitTestHelper.createMockNPC();
    testItem = await unitTestHelper.createMockItem();

    inventoryItemContainer = (await characterItemContainer.getInventoryItemContainer(testCharacter)) as IItemContainer;

    const addedItem = await characterItemContainer.addItemToContainer(
      testItem,
      testCharacter,
      inventoryItemContainer._id
    );

    expect(addedItem).toBeTruthy();

    inventory = (await characterInventory.getInventory(testCharacter)) as IItem;
  });

  it("should successfully deposit an item from character inventory", async () => {
    const result = await depositItem.deposit(testCharacter, {
      itemId: testItem._id,
      npcId: testNPC._id,
      fromContainerId: inventoryItemContainer._id,
    });

    expect(result).toBeTruthy();
  });
});
