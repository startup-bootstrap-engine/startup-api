import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ICharacterItemBuff,
  ICharacterTemporaryBuff,
} from "@rpg-engine/shared";
import { CharacterBuffTracker } from "../CharacterBuffTracker";
describe("CharacterBuffTracker", () => {
  let characterBuffTracker: CharacterBuffTracker;
  let testCharacter: ICharacter;

  beforeAll(() => {
    characterBuffTracker = container.get(CharacterBuffTracker);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
  });

  afterEach(async () => {
    await characterBuffTracker.deleteAllCharacterBuffs(testCharacter);
  });

  const createTestBuff = (): Partial<ICharacterTemporaryBuff> => {
    return {
      type: CharacterBuffType.CharacterAttribute,
      trait: BasicAttribute.Strength,
      buffPercentage: 10,
      durationSeconds: 3600,
      durationType: CharacterBuffDurationType.Temporary,
    };
  };

  it("should add a buff to a character", async () => {
    const testBuff = createTestBuff() as ICharacterTemporaryBuff;

    const result = await characterBuffTracker.addBuff(testCharacter._id, testBuff);

    expect(result).toBeTruthy();
  });

  it("should get a buff by ID", async () => {
    const testBuff = createTestBuff() as ICharacterTemporaryBuff;

    const addedBuff = await characterBuffTracker.addBuff(testCharacter._id, testBuff);

    if (!addedBuff) throw new Error("Buff ID not defined");

    const retrievedBuff = await characterBuffTracker.getBuff(testCharacter._id, addedBuff._id!);

    expect(retrievedBuff).toBeDefined();
    expect(retrievedBuff).toMatchObject(testBuff);
  });

  it("should delete a buff by ID", async () => {
    let testBuff = createTestBuff() as ICharacterTemporaryBuff;

    testBuff = (await characterBuffTracker.addBuff(testCharacter._id, testBuff)) as ICharacterTemporaryBuff;

    const result = await characterBuffTracker.deleteBuff(testCharacter, testBuff._id!, testBuff.trait!);

    expect(result).toBeTruthy();

    const deletedBuff = await characterBuffTracker.getBuff(testCharacter._id, testBuff._id!);

    expect(deletedBuff).toBeFalsy();
  });

  it("should delete all buffs for a character", async () => {
    let testBuff1 = createTestBuff() as ICharacterTemporaryBuff;
    let testBuff2 = { ...createTestBuff(), trait: CharacterAttributes.MaxMana } as ICharacterTemporaryBuff;

    testBuff1 = (await characterBuffTracker.addBuff(testCharacter._id, testBuff1)) as ICharacterTemporaryBuff;
    testBuff2 = (await characterBuffTracker.addBuff(testCharacter._id, testBuff2)) as ICharacterTemporaryBuff;

    const result = await characterBuffTracker.deleteAllCharacterBuffs(testCharacter);

    expect(result).toBeTruthy();

    const deletedBuff1 = await characterBuffTracker.getBuff(testCharacter._id, testBuff1._id!);
    const deletedBuff2 = await characterBuffTracker.getBuff(testCharacter._id, testBuff2._id!);

    expect(deletedBuff1).toBeFalsy();
    expect(deletedBuff2).toBeFalsy();
  });

  it("should get all character buffs", async () => {
    const testBuff1 = createTestBuff() as ICharacterTemporaryBuff;
    const testBuff2 = { ...createTestBuff(), trait: CharacterAttributes.MaxMana } as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter._id, testBuff1);
    await characterBuffTracker.addBuff(testCharacter._id, testBuff2);

    const allCharacterBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter._id);

    expect(allCharacterBuffs.length).toEqual(2);
    expect(allCharacterBuffs).toContainEqual(
      expect.objectContaining({
        ...testBuff1,
        owner: testCharacter._id,
      })
    );
    expect(allCharacterBuffs).toContainEqual(
      expect.objectContaining({
        ...testBuff2,
        owner: testCharacter._id,
      })
    );
  });

  it("should return an empty array when getting buffs for a character with no buffs", async () => {
    const allCharacterBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter._id);

    expect(allCharacterBuffs).toEqual([]);
  });

  it("should delete only temporary buffs for a character when specified", async () => {
    const testTemporaryBuff = createTestBuff() as ICharacterTemporaryBuff;
    const testPermanentBuff = {
      ...createTestBuff(),
      durationType: CharacterBuffDurationType.Permanent,
    } as unknown as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter._id, testTemporaryBuff);
    await characterBuffTracker.addBuff(testCharacter._id, testPermanentBuff);

    const result = await characterBuffTracker.deleteAllCharacterBuffs(testCharacter, { deleteTemporaryOnly: true });

    expect(result).toBeTruthy();

    const remainingBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter._id);

    expect(remainingBuffs.length).toEqual(1);
    expect(remainingBuffs).toContainEqual(
      expect.objectContaining({
        ...testPermanentBuff,
        owner: testCharacter._id,
      })
    );
  });

  it("should delete all character buffs when deleteTemporaryOnly is false or not provided", async () => {
    const testTemporaryBuff = createTestBuff() as ICharacterTemporaryBuff;
    const testPermanentBuff = {
      ...createTestBuff(),
      durationType: CharacterBuffDurationType.Permanent,
    } as unknown as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter._id, testTemporaryBuff);
    await characterBuffTracker.addBuff(testCharacter._id, testPermanentBuff);

    const result = await characterBuffTracker.deleteAllCharacterBuffs(testCharacter, { deleteTemporaryOnly: false });

    expect(result).toBeTruthy();

    const remainingBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter._id);

    expect(remainingBuffs.length).toEqual(0);
  });

  it("should delete all character buffs when deleteTemporaryOnly option is not provided", async () => {
    const testTemporaryBuff = createTestBuff() as ICharacterTemporaryBuff;
    const testPermanentBuff = {
      ...createTestBuff(),
      durationType: CharacterBuffDurationType.Permanent,
    } as unknown as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter._id, testTemporaryBuff);
    await characterBuffTracker.addBuff(testCharacter._id, testPermanentBuff);

    const result = await characterBuffTracker.deleteAllCharacterBuffs(testCharacter);

    expect(result).toBeTruthy();

    const remainingBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter._id);

    expect(remainingBuffs.length).toEqual(0);
  });

  it("should get all buff absolute changes for a specific trait", async () => {
    const testBuff1 = {
      ...createTestBuff(),
      absoluteChange: 5,
    } as ICharacterTemporaryBuff;
    const testBuff2 = {
      ...createTestBuff(),
      trait: BasicAttribute.Dexterity,
      absoluteChange: 10,
    } as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter._id, testBuff1);
    await characterBuffTracker.addBuff(testCharacter._id, testBuff2);

    const totalAbsoluteChange = await characterBuffTracker.getAllBuffAbsoluteChanges(
      testCharacter._id,
      BasicAttribute.Strength
    );

    expect(totalAbsoluteChange).toEqual(5);
  });

  it("should get buff by item ID", async () => {
    const testBuff = {
      ...createTestBuff(),
      itemId: "test-item-id",
    } as unknown as ICharacterItemBuff;

    await characterBuffTracker.addBuff(testCharacter._id, testBuff);

    const retrievedBuff = await characterBuffTracker.getBuffsByItemId(testCharacter._id, "test-item-id");

    expect(retrievedBuff).toBeDefined();
    expect(retrievedBuff).toMatchObject([testBuff]);
  });

  it("should get multiple buffs by item ID", async () => {
    // Create test buffs
    const testBuff1 = {
      ...createTestBuff(),
      itemId: "test-item-id",
    } as unknown as ICharacterItemBuff;

    const testBuff2 = {
      ...createTestBuff(),
      itemId: "test-item-id",
    } as unknown as ICharacterItemBuff;

    // Add test buffs to character
    await characterBuffTracker.addBuff(testCharacter._id, testBuff1);
    await characterBuffTracker.addBuff(testCharacter._id, testBuff2);

    // Get buffs by item ID
    const retrievedBuffs = await characterBuffTracker.getBuffsByItemId(testCharacter.id, "test-item-id");

    // Assertions
    expect(retrievedBuffs).toBeDefined();
    expect(retrievedBuffs.length).toBe(2);
    expect(retrievedBuffs).toMatchObject([testBuff1, testBuff2]);
  });

  it("should return empty array if buff with item ID is not found", async () => {
    const retrievedBuff = await characterBuffTracker.getBuffsByItemId(testCharacter._id, "nonexistent-item-id");

    expect(retrievedBuff).toEqual([]);
  });

  it("should get buff by item key", async () => {
    const testBuff = {
      ...createTestBuff(),
      itemKey: "test-item-key",
    } as unknown as ICharacterItemBuff;

    await characterBuffTracker.addBuff(testCharacter._id, testBuff);

    const retrievedBuff = await characterBuffTracker.getBuffByItemKey(testCharacter, "test-item-key");

    expect(retrievedBuff).toBeDefined();
    expect(retrievedBuff).toMatchObject(testBuff);
  });

  it("should return falsy if buff with item key is not found", async () => {
    const retrievedBuff = await characterBuffTracker.getBuffByItemKey(testCharacter, "nonexistent-item-key");

    expect(retrievedBuff).toBeFalsy();
  });

  it("should return true when character has buffs", async () => {
    const testBuff = createTestBuff() as ICharacterTemporaryBuff;
    await characterBuffTracker.addBuff(testCharacter._id, testBuff);

    const hasBuffs = await characterBuffTracker.hasBuffs(testCharacter._id);
    expect(hasBuffs).toBe(true);
  });

  it("should return false when character has no buffs", async () => {
    const hasBuffs = await characterBuffTracker.hasBuffs(testCharacter._id);
    expect(hasBuffs).toBe(false);
  });

  it("should return true when character has buffs for a specific trait", async () => {
    const testBuff = createTestBuff() as ICharacterTemporaryBuff;
    await characterBuffTracker.addBuff(testCharacter._id, testBuff);

    const hasBuffs = await characterBuffTracker.hasBuffsByTrait(testCharacter._id, BasicAttribute.Strength);
    expect(hasBuffs).toBe(true);
  });

  it("should return false when character has no buffs for a specific trait", async () => {
    const hasBuffs = await characterBuffTracker.hasBuffsByTrait(testCharacter._id, BasicAttribute.Dexterity);
    expect(hasBuffs).toBe(false);
  });

  it("should get all buff percentage changes for a specific trait", async () => {
    const testBuff1 = {
      ...createTestBuff(),
      buffPercentage: 5,
    } as ICharacterTemporaryBuff;
    const testBuff2 = {
      ...createTestBuff(),
      buffPercentage: 10,
    } as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter._id, testBuff1);
    await characterBuffTracker.addBuff(testCharacter._id, testBuff2);

    const totalPercentageChange = await characterBuffTracker.getAllBuffPercentageChanges(
      testCharacter._id,
      BasicAttribute.Strength
    );

    expect(totalPercentageChange).toEqual(15);
  });

  it("should return 0 for buff absolute changes when no buffs exist", async () => {
    const totalAbsoluteChange = await characterBuffTracker.getAllBuffAbsoluteChanges(
      testCharacter._id,
      BasicAttribute.Strength
    );

    expect(totalAbsoluteChange).toEqual(0);
  });

  it("should return 0 for buff percentage changes when no buffs exist", async () => {
    const totalPercentageChange = await characterBuffTracker.getAllBuffPercentageChanges(
      testCharacter._id,
      BasicAttribute.Strength
    );

    expect(totalPercentageChange).toEqual(0);
  });

  it("should handle errors when adding a buff", async () => {
    const invalidBuff = {} as ICharacterTemporaryBuff; // Invalid buff object

    await expect(characterBuffTracker.addBuff(testCharacter._id, invalidBuff)).rejects.toThrow();
  });

  it("should handle errors when deleting a non-existent buff", async () => {
    const nonExistentBuffId = "non-existent-buff-id";

    const result = await characterBuffTracker.deleteBuff(testCharacter, nonExistentBuffId, BasicAttribute.Strength);
    expect(result).toBe(false);
  });

  it("should clear cache after adding a buff", async () => {
    const testBuff = createTestBuff() as ICharacterTemporaryBuff;
    const clearCacheSpy = jest.spyOn(characterBuffTracker, "clearCache");

    await characterBuffTracker.addBuff(testCharacter._id, testBuff);

    expect(clearCacheSpy).toHaveBeenCalledWith(expect.objectContaining({ _id: testCharacter._id }), testBuff.trait);
  });

  it("should clear cache after deleting a buff", async () => {
    const testBuff = createTestBuff() as ICharacterTemporaryBuff;
    const addedBuff = await characterBuffTracker.addBuff(testCharacter._id, testBuff);
    const clearCacheSpy = jest.spyOn(characterBuffTracker, "clearCache");

    if (addedBuff && addedBuff._id) {
      await characterBuffTracker.deleteBuff(testCharacter, addedBuff._id, testBuff.trait);
    }

    expect(clearCacheSpy).toHaveBeenCalledWith(expect.objectContaining({ _id: testCharacter._id }), testBuff.trait);
  });
});
