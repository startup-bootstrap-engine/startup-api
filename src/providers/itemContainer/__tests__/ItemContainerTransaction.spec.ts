import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ItemContainerTransaction } from "../ItemContainerTransaction";

describe("ItemContainerTransaction", () => {
  let originContainer: IItemContainer;
  let targetContainer: IItemContainer;
  let testCharacter: ICharacter;
  let testItem: IItem;
  let itemContainerTransaction: ItemContainerTransaction;
  let characterItemContainer: CharacterItemContainer;

  beforeAll(() => {
    itemContainerTransaction = container.resolve(ItemContainerTransaction);
    characterItemContainer = container.get(CharacterItemContainer);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
    testItem = await unitTestHelper.createMockItem();
    originContainer = await unitTestHelper.createMockItemContainer({ owner: testCharacter._id });
    targetContainer = await unitTestHelper.createMockItemContainer({ owner: testCharacter._id });
    await characterItemContainer.addItemToContainer(testItem, testCharacter, originContainer._id);

    originContainer = await ItemContainer.findById(originContainer._id).lean(); // refresh container
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
});
