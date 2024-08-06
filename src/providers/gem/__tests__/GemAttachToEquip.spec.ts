import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import {
  ArmorsBlueprint,
  CraftingResourcesBlueprint,
  GemsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { AnimationEffectKeys, IItemGem, ItemSubType, ItemType } from "@rpg-engine/shared";
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
  let sendErrorMessageToCharacterSpy: jest.SpyInstance;

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

    // Add test gem and equip to inventory
    inventoryItemContainer = (await characterInventory.getInventoryItemContainer(testCharacter)) as IItemContainer;

    await characterItemContainer.addItemToContainer(testGemItem, testCharacter, inventoryItemContainer._id, {
      shouldAddOwnership: true,
    });

    await characterItemContainer.addItemToContainer(testEquipItem, testCharacter, inventoryItemContainer._id, {
      shouldAddOwnership: true,
    });

    // Update data
    testGemItem = await Item.findById(testGemItem._id).lean();
    testEquipItem = await Item.findById(testEquipItem._id).lean();

    // @ts-ignore
    sendErrorMessageToCharacterSpy = jest.spyOn(gemAttachToEquip.socketMessaging, "sendErrorMessageToCharacter");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should attach a gem to equip and consume it", async () => {
    expect(testEquipItem.attack).toBe(8);
    expect(testEquipItem.defense).toBe(7);

    const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testEquipItem, testCharacter);
    expect(result).toBe(true);

    const updatedEquipItem = (await Item.findById(testEquipItem._id).lean()) as IItem;

    expect(updatedEquipItem.attack).toBe(68);
    expect(updatedEquipItem.defense).toBe(66);

    // Verify the gem was consumed
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
      "Attached 'Ruby Gem' to Sword. Increased stats by: +60 attack, +59 defense. Added effects: burning."
    );
  });

  it("should update the equippedBuffDescription of the target item correctly", async () => {
    testEquipItem = await Item.findByIdAndUpdate(
      testEquipItem._id,
      {
        equippedBuffDescription: "Initial description.",
        owner: testCharacter._id,
      },
      { new: true }
    ).lean();

    // Perform the gem attachment operation
    const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testEquipItem, testCharacter);

    expect(result).toBe(true);

    // Fetch the updated item
    const updatedEquipItem = await Item.findById(testEquipItem._id).lean();

    // Check updated description
    expect(updatedEquipItem?.equippedBuffDescription).toStrictEqual(
      "Initial description. Ruby Gem: +60 atk, +59 def, 68% chance to apply burning effects. Additional buffs: sword: +20%, resistance: +15%, magicResistance: +15%."
    );
  });

  describe("isArmorOrShield logic", () => {
    it("should increase only defense if target item is armor or shield", async () => {
      // Assuming 'Armor' is a type and 'Shield' is a subtype in the ItemType and ItemSubType enums respectively
      let testArmorItem = await unitTestHelper.createMockItemFromBlueprint(ArmorsBlueprint.DarkArmor);

      // Add the armor item to the character's inventory
      await characterItemContainer.addItemToContainer(testArmorItem, testCharacter, inventoryItemContainer._id, {
        shouldAddOwnership: true,
      });

      // Update the armor item for test
      testArmorItem = await Item.findByIdAndUpdate(
        testArmorItem._id,
        {
          attack: 5,
          defense: 5,
        },
        { new: true }
      ).lean();

      // Perform the gem attachment
      await gemAttachToEquip.attachGemToEquip(testGemItem, testArmorItem, testCharacter);

      // Fetch the updated armor item
      const updatedArmorItem = await Item.findById(testArmorItem._id).lean();

      // Check that only defense was increased
      expect(updatedArmorItem?.attack).toBe(5); // Unchanged
      expect(updatedArmorItem?.defense).toBe(64); // Increased by gem's defense stat
    });

    it("should increase both attack and defense if target item is not armor or shield", async () => {
      // Setup a weapon item that is neither armor nor shield
      let testWeaponItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);

      // Add the weapon item to the character's inventory
      await characterItemContainer.addItemToContainer(testWeaponItem, testCharacter, inventoryItemContainer._id, {
        shouldAddOwnership: true,
      });

      // Update the weapon item for test
      testWeaponItem = await Item.findByIdAndUpdate(
        testWeaponItem._id,
        {
          attack: 10,
          defense: 10,
          type: ItemType.Weapon,
        },
        { new: true }
      ).lean();

      // Perform the gem attachment
      await gemAttachToEquip.attachGemToEquip(testGemItem, testWeaponItem, testCharacter);

      // Fetch the updated weapon item
      const updatedWeaponItem = await Item.findById(testWeaponItem._id).lean();

      // Check that both attack and defense were increased
      expect(updatedWeaponItem?.attack).toBe(70); // Increased by gem's attack stat
      expect(updatedWeaponItem?.defense).toBe(69); // Increased by gem's defense stat
    });
  });

  describe("Edge cases & validation", () => {
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

    it("should send error message and return if the target is not a weapon", async () => {
      const testNonWeaponItem = await unitTestHelper.createMockItemFromBlueprint(
        CraftingResourcesBlueprint.PolishedStone
      ); // Non-weapon item
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testNonWeaponItem, testCharacter);
      expect(result).toBe(false);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you can't attach gems to this item."
      );
    });

    it("should send error message and return if the gem is already equipped", async () => {
      // @ts-ignore
      testEquipItem.attachedGems = [{ key: GemsBlueprint.RubyGem }]; // Gem already attached
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testEquipItem, testCharacter);
      expect(result).toBe(false);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you already have this gem equipped."
      );
    });

    it("should send error message if number of gems equipped is greater than the tier can hold", async () => {
      // @ts-ignore
      testEquipItem.attachedGems = new Array(3).fill({ key: GemsBlueprint.AmethystGem }); // Maximum tier capacity reached
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testEquipItem, testCharacter);
      expect(result).toBe(false);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you can only attach up to 1 gems to tier 0 items."
      );
    });

    it("should trigger the correct animation event upon successful gem attachment", async () => {
      const sendAnimationEventToCharacterSpy = jest.spyOn(
        // @ts-ignore
        gemAttachToEquip.animationEffect,
        "sendAnimationEventToCharacter"
      );

      // Perform the gem attachment operation
      await gemAttachToEquip.attachGemToEquip(testGemItem, testEquipItem, testCharacter);

      // Check that the animation event was triggered
      expect(sendAnimationEventToCharacterSpy).toHaveBeenCalledWith(testCharacter, AnimationEffectKeys.LevelUp);
    });

    it("should update the equippedBuffDescription for armors with specific stat boosts", async () => {
      // Set up an armor item
      const testArmorItem = await unitTestHelper.createMockItemFromBlueprint(ArmorsBlueprint.DarkArmor, {
        equippedBuffDescription: "Base defense: 50.",
        owner: testCharacter._id,
      });

      await characterItemContainer.addItemToContainer(testArmorItem, testCharacter, inventoryItemContainer._id, {
        shouldAddOwnership: true,
      });

      // Perform the gem attachment
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testArmorItem, testCharacter);

      expect(result).toBe(true);

      // Fetch the updated armor item
      const updatedArmorItem = await Item.findById(testArmorItem._id).lean();

      // Verify updated description includes specific stat boosts
      expect(updatedArmorItem?.equippedBuffDescription).toContain("Base defense: 50. Ruby Gem: +59 def.");
    });

    it("should ensure only defense is increased when a defense-only gem is attached to a shield", async () => {
      // Setup a shield item
      let testShieldItem = await unitTestHelper.createMockItemFromBlueprint(ShieldsBlueprint.WoodenShield);
      testShieldItem = await Item.findByIdAndUpdate(
        testShieldItem._id,
        {
          attack: 0,
          defense: 10,
          subType: ItemSubType.Shield,
          owner: testCharacter._id,
        },
        { new: true }
      ).lean();

      // Perform the gem attachment
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testShieldItem, testCharacter);

      expect(result).toBe(true);

      // Fetch the updated shield item
      const updatedShieldItem = await Item.findById(testShieldItem._id).lean();

      // Verify that only defense was increased
      expect(updatedShieldItem?.attack).toBe(0); // Unchanged
      expect(updatedShieldItem?.defense).toBe(69); // Increased by gem's defense stat
    });

    it("should allow attaching gems to a bow", async () => {
      // Setup a bow item
      const testBowItem = await unitTestHelper.createMockItemFromBlueprint(RangedWeaponsBlueprint.Bow);

      // Add the bow item to the character's inventory
      await characterItemContainer.addItemToContainer(testBowItem, testCharacter, inventoryItemContainer._id, {
        shouldAddOwnership: true,
      });

      let updatedBowItem = await Item.findById(testBowItem._id).lean<IItem>();

      // Perform the gem attachment
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, updatedBowItem, testCharacter);
      expect(result).toBe(true);

      // Fetch the updated bow item
      updatedBowItem = await Item.findById(testBowItem._id).lean();

      // Check that the gem was attached correctly
      const attachedGemsMetadata = updatedBowItem?.attachedGems as IAttachedItemGem[];
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

    it("should fail when trying to attach gems to stackable items", async () => {
      // Setup a shuriken item
      let testShurikenItem = await unitTestHelper.createMockItemFromBlueprint(RangedWeaponsBlueprint.Shuriken);

      // Add the shuriken item to the character's inventory
      await characterItemContainer.addItemToContainer(testShurikenItem, testCharacter, inventoryItemContainer._id, {
        shouldAddOwnership: true,
      });

      // Ensure shuriken has initial stats set correctly
      testShurikenItem = await Item.findByIdAndUpdate(
        testShurikenItem._id,
        { attack: 5, defense: 5 },
        { new: true }
      ).lean();

      // Perform the gem attachment
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testShurikenItem, testCharacter);
      expect(result).toBe(false);
    });

    it("should handle items with undefined attack or defense values", async () => {
      // Setup an item with undefined attack and defense
      const testUndefinedItem = await unitTestHelper.createMockItem({
        attack: undefined,
        defense: undefined,
        owner: testCharacter._id,
      });

      // Add the item to the character's inventory
      await characterItemContainer.addItemToContainer(testUndefinedItem, testCharacter, inventoryItemContainer._id, {
        shouldAddOwnership: true,
      });

      // Perform the gem attachment
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, testUndefinedItem, testCharacter);
      expect(result).toBe(true);

      // Fetch the updated item
      const updatedItem = await Item.findById(testUndefinedItem._id).lean();

      // Verify that attack and defense are updated from undefined
      expect(updatedItem?.attack).toBe(testGemBlueprint.gemStatBuff.attack);
      expect(updatedItem?.defense).toBe(testGemBlueprint.gemStatBuff.defense);
    });

    it("should not allow attaching gems to an item that is not owned by the character", async () => {
      // Setup an item not owned by the character
      const unownedItem = await unitTestHelper.createMockItem({
        owner: undefined, // Not owned by any character
      });

      // Attempt to attach the gem
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem, unownedItem, testCharacter);
      expect(result).toBe(false);

      // Verify the equipment stats remain unchanged
      const unchangedEquipItem = await Item.findById(unownedItem._id).lean();
      expect(unchangedEquipItem?.attack).toBe(unownedItem.attack);
      expect(unchangedEquipItem?.defense).toBe(unownedItem.defense);
    });
  });
});
