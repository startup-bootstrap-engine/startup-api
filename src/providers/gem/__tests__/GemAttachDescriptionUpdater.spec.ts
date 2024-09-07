import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { container } from "@providers/inversify/container";
import { GemsBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
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
    testEquipItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword, {
      equippedBuffDescription: "Increases sword skill by 13%",
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
      "Base: Increases sword skill by 13%. Ruby Gem: +60 atk, +59 def, 68% chance of applying burning effects. Additional buffs: Sword: +20%, Resistance: +15%, Magic Resistance: +15%"
    );
  });

  it("should update description for multiple gems", async () => {
    const initialDescription = "Increases sword skill by 13%";
    await Item.findByIdAndUpdate(testEquipItem._id, {
      equippedBuffDescription: initialDescription,
      attachedGems: [testGemBlueprint1],
    });

    await gemAttachDescriptionUpdater.updateTargetEquippedBuffDescription(testEquipItem, testGemBlueprint2, false);

    const updatedItem = await Item.findById(testEquipItem._id).lean();
    expect(updatedItem?.equippedBuffDescription).toBe(
      "Base: Increases sword skill by 13%. Ruby Gem: +60 atk, +59 def, 68% chance of applying burning effects. Additional buffs: Dexterity: +3%, Strength: +2%, Magic: +2%"
    );
  });

  it("should handle items with no initial description", async () => {
    await Item.findByIdAndUpdate(testEquipItem._id, { equippedBuffDescription: "" });

    await gemAttachDescriptionUpdater.updateTargetEquippedBuffDescription(testEquipItem, testGemBlueprint1, false);

    const updatedItem = await Item.findById(testEquipItem._id).lean();
    expect(updatedItem?.equippedBuffDescription).toBe(
      "Ruby Gem: +60 atk, +59 def, 68% chance of applying burning effects. Additional buffs: Sword: +20%, Resistance: +15%, Magic Resistance: +15%"
    );
  });

  it("should handle armor or shield items", async () => {
    const armorItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);
    await Item.findByIdAndUpdate(armorItem._id, { equippedBuffDescription: "Protects against physical damage" });

    await gemAttachDescriptionUpdater.updateTargetEquippedBuffDescription(armorItem, testGemBlueprint1, true);

    const updatedItem = await Item.findById(armorItem._id).lean();
    expect(updatedItem?.equippedBuffDescription).toBe(
      "Base: Protects against physical damage. Ruby Gem: +59 def. Additional buffs: Sword: +20%, Resistance: +15%, Magic Resistance: +15%"
    );
  });

  it("should include additional buffs in the description", async () => {
    const gemWithBuff: IItemGem = {
      ...testGemBlueprint1,
      gemEquippedBuffAdd: { trait: "attackSpeed", buffPercentage: 5 },
    };

    await gemAttachDescriptionUpdater.updateTargetEquippedBuffDescription(testEquipItem, gemWithBuff, false);

    const updatedItem = await Item.findById(testEquipItem._id).lean();
    expect(updatedItem?.equippedBuffDescription).toContain("Additional buffs: Attack Speed: +5%");
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
      "Base: Increases sword skill by 13%. Ruby Gem: +0 atk, +0 def. Additional buffs: Sword: +20%, Resistance: +15%, Magic Resistance: +15%"
    );
  });
});
