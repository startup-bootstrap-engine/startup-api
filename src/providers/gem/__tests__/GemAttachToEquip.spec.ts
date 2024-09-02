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
  let testGemItem1: IItem;
  let testGemItem2: IItem;
  let testEquipItem: IItem;
  let gemAttachToEquip: GemAttachToEquip;
  let characterItemContainer: CharacterItemContainer;
  let inventoryItemContainer: IItemContainer;
  let characterInventory: CharacterInventory;
  let testGemBlueprint1: IItemGem;
  let testGemBlueprint2: IItemGem;
  let sendErrorMessageToCharacterSpy: jest.SpyInstance;

  beforeAll(() => {
    gemAttachToEquip = container.resolve(GemAttachToEquip);
    characterItemContainer = container.resolve(CharacterItemContainer);
    characterInventory = container.resolve(CharacterInventory);

    testGemBlueprint1 = blueprintManager.getBlueprint<IItemGem>("items", GemsBlueprint.RubyGem);
    testGemBlueprint2 = blueprintManager.getBlueprint<IItemGem>("items", GemsBlueprint.SapphireGem);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
    });

    testGemItem1 = await unitTestHelper.createMockItemFromBlueprint(GemsBlueprint.RubyGem);
    testGemItem2 = await unitTestHelper.createMockItemFromBlueprint(GemsBlueprint.SapphireGem);

    testEquipItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);

    // Add test gem and equip to inventory
    inventoryItemContainer = (await characterInventory.getInventoryItemContainer(testCharacter)) as IItemContainer;

    await characterItemContainer.addItemToContainer(testGemItem1, testCharacter, inventoryItemContainer._id, {
      shouldAddOwnership: true,
    });

    await characterItemContainer.addItemToContainer(testGemItem2, testCharacter, inventoryItemContainer._id, {
      shouldAddOwnership: true,
    });

    await characterItemContainer.addItemToContainer(testEquipItem, testCharacter, inventoryItemContainer._id, {
      shouldAddOwnership: true,
    });

    // Update data
    testGemItem1 = await Item.findById(testGemItem1._id).lean();
    testGemItem2 = await Item.findById(testGemItem2._id).lean();
    testEquipItem = await Item.findById(testEquipItem._id).lean();

    // @ts-ignore
    sendErrorMessageToCharacterSpy = jest.spyOn(gemAttachToEquip.socketMessaging, "sendErrorMessageToCharacter");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should attach a gem to equip and consume it", async () => {
    expect(testEquipItem.attack).toBe(8);
    expect(testEquipItem.defense).toBe(7);

    const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);
    expect(result).toBe(true);

    const updatedEquipItem = (await Item.findById(testEquipItem._id).lean()) as IItem;

    expect(updatedEquipItem.attack).toBe(68);
    expect(updatedEquipItem.defense).toBe(66);

    // Verify the gem was consumed
    const gemItem = await Item.findById(testGemItem1._id).lean();
    expect(gemItem).toBeNull();

    const attachedGemsMetadata = updatedEquipItem.attachedGems as IAttachedItemGem[];

    expect(attachedGemsMetadata).toHaveLength(1);

    expect(attachedGemsMetadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: testGemBlueprint1.key,
          name: testGemBlueprint1.name,
          gemEntityEffectsAdd: testGemBlueprint1.gemEntityEffectsAdd,
          gemStatBuff: testGemBlueprint1.gemStatBuff,
        }),
      ])
    );
  });

  it("should send the correct success message upon successful attachment", async () => {
    // @ts-ignore
    const sendMessageSpy = jest.spyOn(gemAttachToEquip.socketMessaging, "sendMessageToCharacter");

    // Perform the gem attachment operation
    await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);

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
    const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);

    expect(result).toBe(true);

    // Fetch the updated item
    const updatedEquipItem = await Item.findById(testEquipItem._id).lean();

    // Check updated description
    expect(updatedEquipItem?.equippedBuffDescription).toStrictEqual(
      "Initial description. Ruby Gem: +60 atk, +59 def, 68% chance of applying burning effects. Additional buffs: Sword: +20%, Resistance: +15%, Magic Resistance: +15%."
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
      await gemAttachToEquip.attachGemToEquip(testGemItem1, testArmorItem, testCharacter);

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
      await gemAttachToEquip.attachGemToEquip(testGemItem1, testWeaponItem, testCharacter);

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
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, unownedEquipItem, testCharacter);
      expect(result).toBe(false);
      // Since the equipment doesn't belong to the character, there's no need to verify its stats
    });

    it("should not attach gem if character fails basic validation", async () => {
      // Setup a mock where character validation fails
      // @ts-ignore
      jest.spyOn(gemAttachToEquip.characterValidation, "hasBasicValidation").mockReturnValueOnce(false);

      // Attempt to attach the gem
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);
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
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testNonWeaponItem, testCharacter);
      expect(result).toBe(false);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you can't attach gems to this item."
      );
    });

    it("should send error message and return if the gem is already equipped", async () => {
      // @ts-ignore
      testEquipItem.attachedGems = [{ key: GemsBlueprint.RubyGem }]; // Gem already attached
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);
      expect(result).toBe(false);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you already have this gem equipped."
      );
    });

    it("should send error message if number of gems equipped is greater than the tier can hold", async () => {
      // @ts-ignore
      testEquipItem.attachedGems = new Array(3).fill({ key: GemsBlueprint.AmethystGem }); // Maximum tier capacity reached
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);
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
      await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);

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
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testArmorItem, testCharacter);

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
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testShieldItem, testCharacter);

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
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, updatedBowItem, testCharacter);
      expect(result).toBe(true);

      // Fetch the updated bow item
      updatedBowItem = await Item.findById(testBowItem._id).lean();

      // Check that the gem was attached correctly
      const attachedGemsMetadata = updatedBowItem?.attachedGems as IAttachedItemGem[];
      expect(attachedGemsMetadata).toHaveLength(1);
      expect(attachedGemsMetadata).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: testGemBlueprint1.key,
            name: testGemBlueprint1.name,
            gemEntityEffectsAdd: testGemBlueprint1.gemEntityEffectsAdd,
            gemStatBuff: testGemBlueprint1.gemStatBuff,
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
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testShurikenItem, testCharacter);
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
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testUndefinedItem, testCharacter);
      expect(result).toBe(true);

      // Fetch the updated item
      const updatedItem = await Item.findById(testUndefinedItem._id).lean();

      // Verify that attack and defense are updated from undefined
      expect(updatedItem?.attack).toBe(testGemBlueprint1.gemStatBuff.attack);
      expect(updatedItem?.defense).toBe(testGemBlueprint1.gemStatBuff.defense);
    });

    it("should not allow attaching gems to an item that is not owned by the character", async () => {
      // Setup an item not owned by the character
      const unownedItem = await unitTestHelper.createMockItem({
        owner: undefined, // Not owned by any character
      });

      // Attempt to attach the gem
      const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, unownedItem, testCharacter);
      expect(result).toBe(false);

      // Verify the equipment stats remain unchanged
      const unchangedEquipItem = await Item.findById(unownedItem._id).lean();
      expect(unchangedEquipItem?.attack).toBe(unownedItem.attack);
      expect(unchangedEquipItem?.defense).toBe(unownedItem.defense);
    });
  });

  it("should correctly stack multiple gems' stats cumulatively", async () => {
    // @ts-ignore
    jest.spyOn(gemAttachToEquip, "getMaxGemsForTier").mockReturnValue(2);

    // Get gem blueprints
    const gemBlueprint1 = await blueprintManager.getBlueprint<IItemGem>("items", GemsBlueprint.RubyGem);
    const gemBlueprint2 = await blueprintManager.getBlueprint<IItemGem>("items", GemsBlueprint.SapphireGem);

    // add second to inventory
    await characterItemContainer.addItemToContainer(testGemItem2, testCharacter, inventoryItemContainer._id, {
      shouldAddOwnership: true,
    });

    // Set initial stats for the equipment
    const initialAttack = 50;
    const initialDefense = 30;
    testEquipItem = await Item.findByIdAndUpdate(
      testEquipItem._id,
      { attack: initialAttack, defense: initialDefense },
      { new: true }
    ).lean();

    // Attach first gem
    const firstAttach = await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);

    expect(firstAttach).toBe(true);

    // Fetch updated equip item after first gem
    let updatedEquipItem = await Item.findById(testEquipItem._id).lean();

    // Check stats after first gem
    const expectedAttackAfterFirstGem = initialAttack + (gemBlueprint1.gemStatBuff?.attack || 0);
    const expectedDefenseAfterFirstGem = initialDefense + (gemBlueprint1.gemStatBuff?.defense || 0);
    expect(updatedEquipItem?.attack).toBe(expectedAttackAfterFirstGem);
    expect(updatedEquipItem?.defense).toBe(expectedDefenseAfterFirstGem);

    // Attach second gem
    const secondAttach = await gemAttachToEquip.attachGemToEquip(
      testGemItem2,
      updatedEquipItem as IItem,
      testCharacter
    );

    expect(secondAttach).toBe(true);

    // Fetch final updated equip item
    updatedEquipItem = await Item.findById(testEquipItem._id).lean();

    // Calculate expected final stats
    const expectedFinalAttack = expectedAttackAfterFirstGem + (gemBlueprint2.gemStatBuff?.attack || 0);
    const expectedFinalDefense = expectedDefenseAfterFirstGem + (gemBlueprint2.gemStatBuff?.defense || 0);

    // Check final stats
    expect(updatedEquipItem?.attack).toBe(expectedFinalAttack);
    expect(updatedEquipItem?.defense).toBe(expectedFinalDefense);
  });

  it("should correctly update the description for multiple gems", async () => {
    // Set initial stats for the equipment
    const initialAttack = 50;
    const initialDefense = 30;
    await Item.findByIdAndUpdate(testEquipItem._id, { attack: initialAttack, defense: initialDefense });

    // Get gem blueprints
    const gemBlueprint1 = await blueprintManager.getBlueprint<IItemGem>("items", GemsBlueprint.RubyGem);
    const gemBlueprint2 = await blueprintManager.getBlueprint<IItemGem>("items", GemsBlueprint.SapphireGem);

    // Attach both gems
    await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);
    await gemAttachToEquip.attachGemToEquip(testGemItem2, testEquipItem, testCharacter);

    // Fetch final updated equip item
    const updatedEquipItem = await Item.findById(testEquipItem._id).lean();

    // Check description

    expect(updatedEquipItem?.equippedBuffDescription).toEqual(
      "Ruby, Sapphire Gems: +68 atk, +65 def, 68% chance of applying burning, vine-grasp effects. Additional buffs: Sword: +20%, Resistance: +15%, Magic Resistance: +15%."
    );

    // Check attached gems metadata
    const attachedGemsMetadata = updatedEquipItem?.attachedGems as unknown as IItemGem[];
    expect(attachedGemsMetadata).toHaveLength(2);
    expect(attachedGemsMetadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: gemBlueprint1.key,
          name: gemBlueprint1.name,
          gemEntityEffectsAdd: gemBlueprint1.gemEntityEffectsAdd,
          gemStatBuff: gemBlueprint1.gemStatBuff,
        }),
        expect.objectContaining({
          key: gemBlueprint2.key,
          name: gemBlueprint2.name,
          gemEntityEffectsAdd: gemBlueprint2.gemEntityEffectsAdd,
          gemStatBuff: gemBlueprint2.gemStatBuff,
        }),
      ])
    );
  });

  it("should not allow attaching gems to stackable items", async () => {
    const stackableItem = await unitTestHelper.createMockItem({
      stackQty: 5,
      maxStackSize: 10,
      owner: testCharacter._id,
    });

    const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, stackableItem, testCharacter);
    expect(result).toBe(false);
    expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, you can't attach gems to this item."
    );
  });

  it("should not allow attaching gems to ranged ammo", async () => {
    const rangedAmmoItem = await unitTestHelper.createMockItem({
      subType: ItemSubType.Ranged,
      maxRange: undefined,
      owner: testCharacter._id,
    });

    const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, rangedAmmoItem, testCharacter);
    expect(result).toBe(false);
    expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, you can't attach gems to this item."
    );
  });

  it("should correctly handle items with undefined attack or defense values", async () => {
    const undefinedStatsItem = await unitTestHelper.createMockItem({
      attack: undefined,
      defense: undefined,
      owner: testCharacter._id,
    });

    const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, undefinedStatsItem, testCharacter);
    expect(result).toBe(true);

    const updatedItem = await Item.findById(undefinedStatsItem._id).lean();
    expect(updatedItem?.attack).toBe(testGemBlueprint1.gemStatBuff?.attack || 0);
    expect(updatedItem?.defense).toBe(testGemBlueprint1.gemStatBuff?.defense || 0);
  });

  it("should correctly update entityEffects and entityEffectChance", async () => {
    const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);
    expect(result).toBe(true);

    const updatedItem = await Item.findById(testEquipItem._id).lean();
    expect(updatedItem?.entityEffects).toEqual(expect.arrayContaining(testGemBlueprint1.gemEntityEffectsAdd || []));
    expect(updatedItem?.entityEffectChance).toBe(testGemBlueprint1.gemEntityEffectChance);
  });

  it("should correctly handle attaching gems to armor or shield", async () => {
    const armorItem = await unitTestHelper.createMockItemFromBlueprint(ArmorsBlueprint.LeatherJacket, {
      owner: testCharacter._id,
    });
    await characterItemContainer.addItemToContainer(armorItem, testCharacter, inventoryItemContainer._id, {
      shouldAddOwnership: true,
    });

    const result = await gemAttachToEquip.attachGemToEquip(testGemItem1, armorItem, testCharacter);
    expect(result).toBe(true);

    const updatedItem = await Item.findById(armorItem._id).lean();
    expect(updatedItem?.attack).toBeFalsy(); // Attack should not change for armor
    expect(updatedItem?.defense).toBe((armorItem.defense || 0) + (testGemBlueprint1.gemStatBuff?.defense || 0));
  });
});
