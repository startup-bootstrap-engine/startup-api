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

    const result = await characterBuffTracker.addBuff(testCharacter, testBuff);

    expect(result).toBeTruthy();
  });

  it("should get a buff by ID", async () => {
    const testBuff = createTestBuff() as ICharacterTemporaryBuff;

    const addedBuff = await characterBuffTracker.addBuff(testCharacter, testBuff);

    if (!addedBuff) throw new Error("Buff ID not defined");

    const retrievedBuff = await characterBuffTracker.getBuff(testCharacter, addedBuff._id!);

    expect(retrievedBuff).toBeDefined();
    expect(retrievedBuff).toMatchObject(testBuff);
  });

  it("should delete a buff by ID", async () => {
    const testBuff = createTestBuff() as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter, testBuff);

    const result = await characterBuffTracker.deleteBuff(testCharacter, testBuff._id!);

    expect(result).toBeTruthy();

    const deletedBuff = await characterBuffTracker.getBuff(testCharacter, testBuff._id!);

    expect(deletedBuff).toBeFalsy();
  });

  it("should delete all buffs for a character", async () => {
    const testBuff1 = createTestBuff() as ICharacterTemporaryBuff;
    const testBuff2 = { ...createTestBuff(), trait: CharacterAttributes.MaxMana } as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter, testBuff1);
    await characterBuffTracker.addBuff(testCharacter, testBuff2);

    const result = await characterBuffTracker.deleteAllCharacterBuffs(testCharacter);

    expect(result).toBeTruthy();

    const deletedBuff1 = await characterBuffTracker.getBuff(testCharacter, testBuff1._id!);
    const deletedBuff2 = await characterBuffTracker.getBuff(testCharacter, testBuff2._id!);

    expect(deletedBuff1).toBeFalsy();
    expect(deletedBuff2).toBeFalsy();
  });

  it("should get all character buffs", async () => {
    const testBuff1 = createTestBuff() as ICharacterTemporaryBuff;
    const testBuff2 = { ...createTestBuff(), trait: CharacterAttributes.MaxMana } as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter, testBuff1);
    await characterBuffTracker.addBuff(testCharacter, testBuff2);

    const allCharacterBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter);

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
    const allCharacterBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter);

    expect(allCharacterBuffs).toEqual([]);
  });

  it("should delete only temporary buffs for a character when specified", async () => {
    const testTemporaryBuff = createTestBuff() as ICharacterTemporaryBuff;
    const testPermanentBuff = {
      ...createTestBuff(),
      durationType: CharacterBuffDurationType.Permanent,
    } as unknown as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter, testTemporaryBuff);
    await characterBuffTracker.addBuff(testCharacter, testPermanentBuff);

    const result = await characterBuffTracker.deleteAllCharacterBuffs(testCharacter, { deleteTemporaryOnly: true });

    expect(result).toBeTruthy();

    const remainingBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter);

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

    await characterBuffTracker.addBuff(testCharacter, testTemporaryBuff);
    await characterBuffTracker.addBuff(testCharacter, testPermanentBuff);

    const result = await characterBuffTracker.deleteAllCharacterBuffs(testCharacter, { deleteTemporaryOnly: false });

    expect(result).toBeTruthy();

    const remainingBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter);

    expect(remainingBuffs.length).toEqual(0);
  });

  it("should delete all character buffs when deleteTemporaryOnly option is not provided", async () => {
    const testTemporaryBuff = createTestBuff() as ICharacterTemporaryBuff;
    const testPermanentBuff = {
      ...createTestBuff(),
      durationType: CharacterBuffDurationType.Permanent,
    } as unknown as ICharacterTemporaryBuff;

    await characterBuffTracker.addBuff(testCharacter, testTemporaryBuff);
    await characterBuffTracker.addBuff(testCharacter, testPermanentBuff);

    const result = await characterBuffTracker.deleteAllCharacterBuffs(testCharacter);

    expect(result).toBeTruthy();

    const remainingBuffs = await characterBuffTracker.getAllCharacterBuffs(testCharacter);

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

    await characterBuffTracker.addBuff(testCharacter, testBuff1);
    await characterBuffTracker.addBuff(testCharacter, testBuff2);

    const totalAbsoluteChange = await characterBuffTracker.getAllBuffAbsoluteChanges(
      testCharacter,
      BasicAttribute.Strength
    );

    expect(totalAbsoluteChange).toEqual(5);
  });

  it("should get buff by item ID", async () => {
    const testBuff = {
      ...createTestBuff(),
      itemId: "test-item-id",
    } as unknown as ICharacterItemBuff;

    await characterBuffTracker.addBuff(testCharacter, testBuff);

    const retrievedBuff = await characterBuffTracker.getBuffByItemId(testCharacter, "test-item-id");

    expect(retrievedBuff).toBeDefined();
    expect(retrievedBuff).toMatchObject(testBuff);
  });

  it("should return undefined if buff with item ID is not found", async () => {
    const retrievedBuff = await characterBuffTracker.getBuffByItemId(testCharacter, "nonexistent-item-id");

    expect(retrievedBuff).toBeUndefined();
  });

  it("should get buff by item key", async () => {
    const testBuff = {
      ...createTestBuff(),
      itemKey: "test-item-key",
    } as unknown as ICharacterItemBuff;

    await characterBuffTracker.addBuff(testCharacter, testBuff);

    const retrievedBuff = await characterBuffTracker.getBuffByItemKey(testCharacter, "test-item-key");

    expect(retrievedBuff).toBeDefined();
    expect(retrievedBuff).toMatchObject(testBuff);
  });

  it("should return falsy if buff with item key is not found", async () => {
    const retrievedBuff = await characterBuffTracker.getBuffByItemKey(testCharacter, "nonexistent-item-key");

    expect(retrievedBuff).toBeFalsy();
  });
});