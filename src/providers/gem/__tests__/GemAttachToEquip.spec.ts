import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GemsBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";

import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { GemAttachToEquip } from "../GemAttachToEquip";

describe("GemAttachToEquip", () => {
  let testCharacter: ICharacter;
  let testGemItem: IItem;
  let testEquipItem: IItem;
  let gemAttachToEquip: GemAttachToEquip;
  let characterItemContainer: CharacterItemContainer;
  let inventoryItemContainer: IItemContainer;
  let characterInventory: CharacterInventory;

  beforeAll(() => {
    gemAttachToEquip = container.resolve(GemAttachToEquip);
    characterItemContainer = container.resolve(CharacterItemContainer);
    characterInventory = container.resolve(CharacterInventory);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
    });

    testGemItem = await unitTestHelper.createMockItemFromBlueprint(GemsBlueprint.RubyGem);

    testEquipItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);

    // add test gem and equip to inventory

    inventoryItemContainer = (await characterInventory.getInventoryItemContainer(testCharacter)) as IItemContainer;

    await characterItemContainer.addItemToContainer(testGemItem, testCharacter, inventoryItemContainer._id, {
      shouldAddOwnership: true,
    });

    await characterItemContainer.addItemToContainer(testEquipItem, testCharacter, inventoryItemContainer._id, {
      shouldAddOwnership: true,
    });

    // update data
    testGemItem = await Item.findById(testGemItem._id).lean();
    testEquipItem = await Item.findById(testEquipItem._id).lean();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should attach gem to equip", async () => {
    expect(testEquipItem.attack).toBe(8);
    expect(testEquipItem.defense).toBe(7);

    const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testEquipItem, testCharacter);
    expect(result).toBe(true);

    const updatedEquipItem = (await Item.findById(testEquipItem._id).lean()) as IItem;

    expect(updatedEquipItem.attack).toBe(13);
    expect(updatedEquipItem.defense).toBe(10);
  });
});
