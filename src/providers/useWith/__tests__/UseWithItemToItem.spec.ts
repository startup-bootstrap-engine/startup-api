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
  };

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
    });

    testOriginItem = await unitTestHelper.createMockItemFromBlueprint(GemsBlueprint.RubyGem);
    testTargetItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.BroadSword);

    await addOriginAndTargetItemsToInventory();
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
});
