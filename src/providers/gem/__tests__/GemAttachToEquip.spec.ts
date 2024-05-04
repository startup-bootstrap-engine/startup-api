import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import { GemsBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";

import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { IItemGem } from "@rpg-engine/shared";
import { GemAttachToEquip, IAttachedItemGem } from "../GemAttachToEquip";

describe("GemAttachToEquip", () => {
  let testCharacter: ICharacter;
  let testGemItem: IItem;
  let testEquipItem: IItem;
  let gemAttachToEquip: GemAttachToEquip;
  let characterItemContainer: CharacterItemContainer;
  let inventoryItemContainer: IItemContainer;
  let characterInventory: CharacterInventory;
  let testGemBlueprint: IItemGem;

  beforeAll(() => {
    gemAttachToEquip = container.resolve(GemAttachToEquip);
    characterItemContainer = container.resolve(CharacterItemContainer);
    characterInventory = container.resolve(CharacterInventory);

    testGemBlueprint = blueprintManager.getBlueprint<IItemGem>("items", GemsBlueprint.RubyGem);
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

  it("should attach a gem to equip and consume it", async () => {
    expect(testEquipItem.attack).toBe(8);
    expect(testEquipItem.defense).toBe(7);

    const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testEquipItem, testCharacter);
    expect(result).toBe(true);

    const updatedEquipItem = (await Item.findById(testEquipItem._id).lean()) as IItem;

    expect(updatedEquipItem.attack).toBe(18);
    expect(updatedEquipItem.defense).toBe(15);

    // verify the gem was consumed
    const gemItem = await Item.findById(testGemItem._id).lean();

    expect(gemItem).toBeNull();

    const attachedGemsMetadata = updatedEquipItem.attachedGems as IAttachedItemGem[];

    expect(attachedGemsMetadata).toHaveLength(1);

    expect(attachedGemsMetadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: testGemBlueprint.key,
          name: testGemBlueprint.name,
          gemEntityEffectsAdd: testGemBlueprint.gemEntityEffectsAdd,
          gemStatBuff: testGemBlueprint.gemStatBuff,
        }),
      ])
    );
  });

  it("should send the correct success message upon successful attachment", async () => {
    // @ts-ignore
    const sendMessageSpy = jest.spyOn(gemAttachToEquip.socketMessaging, "sendMessageToCharacter");

    // Perform the gem attachment operation
    await gemAttachToEquip.attachGemToEquip(testGemItem, testEquipItem, testCharacter);

    // Check that sendMessageToCharacter was called
    expect(sendMessageSpy).toHaveBeenCalled();

    expect(sendMessageSpy).toHaveBeenCalledWith(
      testCharacter,
      "Attached 'Ruby Gem' to Sword. Increased stats by: +10 attack, +8 defense. Added effects: burning."
    );
  });

  describe("Edge cases", () => {
    // Test for attaching an invalid gem type to equipment
    it("should not attach non-gem item to equip", async () => {
      // Setup a non-gem item
      const nonGemItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword); // Assuming this creates a non-gem item
      await characterItemContainer.addItemToContainer(nonGemItem, testCharacter, inventoryItemContainer._id, {
        shouldAddOwnership: true,
      });

      // Attempt to attach the non-gem item
      const result = await gemAttachToEquip.attachGemToEquip(nonGemItem, testEquipItem, testCharacter);
      expect(result).toBe(false);
      // Verify the equipment stats remain unchanged
      const unchangedEquipItem = (await Item.findById(testEquipItem._id).lean()) as IItem;
      expect(unchangedEquipItem.attack).toBe(8);
      expect(unchangedEquipItem.defense).toBe(7);
    });

    // Test for attaching a gem that doesn't belong to the character
    it("should not attach gem that character does not own to equip", async () => {
      // Setup a gem that the character doesn't own
      const unownedGemItem = await unitTestHelper.createMockItemFromBlueprint(GemsBlueprint.RubyGem);
      // Notice we're not adding the gem to the character's inventory to simulate the character not owning it

      // Attempt to attach the unowned gem
      const result = await gemAttachToEquip.attachGemToEquip(unownedGemItem, testEquipItem, testCharacter);
      expect(result).toBe(false);
      // Verify the equipment stats remain unchanged
      const unchangedEquipItem = (await Item.findById(testEquipItem._id).lean()) as IItem;
      expect(unchangedEquipItem.attack).toBe(8);
      expect(unchangedEquipItem.defense).toBe(7);
    });

    // Test for attaching a gem to equipment that doesn't belong to the character
    it("should not attach gem to equip that character does not own", async () => {
      // Setup equipment that the character doesn't own
      const unownedEquipItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);
      // Notice we're not adding the equipment to the character's inventory to simulate the character not owning it

      // Attempt to attach the gem to the unowned equipment
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, unownedEquipItem, testCharacter);
      expect(result).toBe(false);
      // Since the equipment doesn't belong to the character, there's no need to verify its stats
    });

    it("should not attach gem if character fails basic validation", async () => {
      // Setup a mock where character validation fails
      // @ts-ignore
      jest.spyOn(gemAttachToEquip.characterValidation, "hasBasicValidation").mockReturnValueOnce(false);

      // Attempt to attach the gem
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testEquipItem, testCharacter);
      expect(result).toBe(false);
      // Verify the equipment stats remain unchanged
      const unchangedEquipItem = (await Item.findById(testEquipItem._id).lean()) as IItem;
      expect(unchangedEquipItem.attack).toBe(8);
      expect(unchangedEquipItem.defense).toBe(7);
    });
  });
});
