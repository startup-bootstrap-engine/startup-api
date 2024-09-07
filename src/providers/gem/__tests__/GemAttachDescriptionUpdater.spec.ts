import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { container } from "@providers/inversify/container";
import { ArmorsBlueprint, GemsBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { UnitTestHelper } from "@providers/unitTests/UnitTestHelper";
import { IItemGem } from "@rpg-engine/shared";
import { GemAttachDescriptionUpdater } from "../GemAttachDescriptionUpdater";
import { GemAttachToEquip } from "../GemAttachToEquip";

describe("GemAttachDescriptionUpdater", () => {
  let testCharacter: ICharacter;
  let testGemItem1: IItem;
  let testGemItem2: IItem;
  let testEquipItem: IItem;
  let gemAttachDescriptionUpdater: GemAttachDescriptionUpdater;
  let unitTestHelper: UnitTestHelper;
  let blueprintManager: BlueprintManager;
  let testGemBlueprint1: IItemGem;
  let testGemBlueprint2: IItemGem;
  let gemAttachToEquip: GemAttachToEquip;
  let characterItemContainer: CharacterItemContainer;
  let characterInventory: CharacterInventory;
  let inventoryItemContainer: IItemContainer;

  beforeAll(() => {
    gemAttachDescriptionUpdater = container.resolve(GemAttachDescriptionUpdater);
    gemAttachToEquip = container.get(GemAttachToEquip);
    unitTestHelper = container.resolve(UnitTestHelper);
    blueprintManager = container.resolve(BlueprintManager);
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

    testGemItem1 = await unitTestHelper.createMockItemFromBlueprint(GemsBlueprint.RubyGem, {
      owner: testCharacter._id,
    });
    testGemItem2 = await unitTestHelper.createMockItemFromBlueprint(GemsBlueprint.SapphireGem, {
      owner: testCharacter._id,
    });
    testEquipItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.VenomousStinger, {
      owner: testCharacter._id,
    });

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

    testGemItem1 = await Item.findById(testGemItem1._id).lean();
    testGemItem2 = await Item.findById(testGemItem2._id).lean();
    testEquipItem = await Item.findById(testEquipItem._id).lean();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should update description for a single gem", async () => {
    await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);

    const updatedItem = await Item.findById(testEquipItem._id).lean();
    expect(updatedItem?.equippedBuffDescription).toBe(
      "Ruby Gem: 165 atk (105+60), 144 def (85+59). Buffs: Sword +33% (13+20), Resistance +15%, Magic resistance +15%. Effects: Burning (68%)."
    );
  });

  it("should update the equippedBuffDescription for armors with specific stat boosts", async () => {
    // Set up an armor item
    const testArmorItem = await unitTestHelper.createMockItemFromBlueprint(ArmorsBlueprint.DarkArmor, {
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
    expect(updatedArmorItem?.equippedBuffDescription).toContain(
      "Ruby Gem: 111 def (52+59). Buffs: Resistance +30% (15+15), Magic resistance +30% (15+15), Max health +15%, Sword +20%."
    );
  });

  it("should handle items with no initial description", async () => {
    testEquipItem = await Item.findByIdAndUpdate(
      testEquipItem._id,
      { equippedBuffDescription: "" },
      { new: true }
    ).lean();

    await gemAttachDescriptionUpdater.updateTargetEquippedBuffDescription(testEquipItem, testGemBlueprint1, false);

    const updatedItem = await Item.findById(testEquipItem._id).lean();
    expect(updatedItem?.equippedBuffDescription).toBe(
      "Ruby Gem: +60 atk, +59 def. Buffs: Sword: +20%, Resistance: +15%, Magic resistance: +15%. Effects: Burning (68%)."
    );
  });

  it("should handle armor or shield items", async () => {
    let armorItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);
    armorItem = await Item.findByIdAndUpdate(
      armorItem._id,
      { equippedBuffDescription: "Protects against physical damage" },
      { new: true }
    ).lean();

    await gemAttachDescriptionUpdater.updateTargetEquippedBuffDescription(armorItem, testGemBlueprint1, true);

    const updatedItem = await Item.findById(armorItem._id).lean();
    expect(updatedItem?.equippedBuffDescription).toBe(
      "Base: Protects against physical damage. Ruby Gem: +59 def. Buffs: Sword: +20%, Resistance: +15%, Magic Resistance: +15%."
    );
  });

  it("should correctly update the description for multiple gems", async () => {
    // Get gem blueprints
    const gemBlueprint1 = await blueprintManager.getBlueprint<IItemGem>("items", GemsBlueprint.RubyGem);
    const gemBlueprint2 = await blueprintManager.getBlueprint<IItemGem>("items", GemsBlueprint.SapphireGem);

    // Attach both gems
    await gemAttachToEquip.attachGemToEquip(testGemItem1, testEquipItem, testCharacter);

    testEquipItem = await Item.findById(testEquipItem._id).lean();

    await gemAttachToEquip.attachGemToEquip(testGemItem2, testEquipItem, testCharacter);

    // Fetch final updated equip item
    const updatedEquipItem = await Item.findById(testEquipItem._id).lean();

    // Check description

    expect(updatedEquipItem?.equippedBuffDescription).toEqual(
      "Ruby, Sapphire Gem: 173 atk (105+68), 150 def (85+65). Buffs: Sword +33% (13+20), Resistance +15%, Magic resistance +15%, Dexterity +3%, Strength +2%, Magic +2%. Effects: Burning, Vine Grasp (68%)."
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

  it("should include additional buffs in the description", async () => {
    const gemWithBuff: IItemGem = {
      ...testGemBlueprint1,
      // @ts-ignore
      gemEquippedBuffAdd: { trait: "attackSpeed", buffPercentage: 5 },
    };

    await gemAttachDescriptionUpdater.updateTargetEquippedBuffDescription(testEquipItem, gemWithBuff, false);

    const updatedItem = await Item.findById(testEquipItem._id).lean();
    const expectedSubstring = "Attack speed +5%";
    expect(updatedItem?.equippedBuffDescription).toContain(expectedSubstring);
  });

  it("should handle gems with no effects or buffs", async () => {
    const plainGem: IItemGem = {
      ...testGemBlueprint1,
      gemEntityEffectsAdd: [],
      gemEntityEffectChance: undefined,
      gemStatBuff: { attack: 0, defense: 0 },
    };

    await gemAttachDescriptionUpdater.updateTargetEquippedBuffDescription(testEquipItem, plainGem, false);

    const updatedItem = await Item.findById(testEquipItem._id).lean();
    expect(updatedItem?.equippedBuffDescription).toBe(
      "Ruby Gem: 105 atk, 85 def. Buffs: Sword +33% (13+20), Resistance +15%, Magic resistance +15%."
    );
  });
});
