/* eslint-disable no-unused-vars */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass, UserAccountTypes } from "@rpg-engine/shared";
import { ManaRegen } from "../ManaRegen";

describe("ManaRegen", () => {
  let manaRegen: ManaRegen;
  let testCharacter: ICharacter;
  let skipManaRegenSpy: jest.SpyInstance;
  let getPremiumAccountTypeSpy: jest.SpyInstance;

  beforeAll(() => {
    manaRegen = container.get(ManaRegen);
  });

  jest.useFakeTimers({
    advanceTimers: true,
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(
      {
        class: CharacterClass.Sorcerer,
        mana: 50,
        maxMana: 100,
      },
      { hasSkills: true }
    );

    // @ts-ignore
    skipManaRegenSpy = jest.spyOn(manaRegen, "shouldSkipManaRegen");

    getPremiumAccountTypeSpy = jest
      // @ts-ignore
      .spyOn(manaRegen.characterPremiumAccount, "getPremiumAccountType")
      .mockResolvedValue(UserAccountTypes.Free);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("autoRegenManaHandler", () => {
    it("should skip mana regeneration for non-mage free account", async () => {
      testCharacter.class = CharacterClass.Warrior;

      await manaRegen.autoRegenManaHandler(testCharacter);

      // check if shouldSkipManaRegen returned true
      expect(skipManaRegenSpy).toHaveBeenCalled();
      expect(skipManaRegenSpy.mock.results[0].value).toBeTruthy();
    });

    it("should call processManaRegeneration for mage premium account", async () => {
      getPremiumAccountTypeSpy = jest
        // @ts-ignore
        .spyOn(manaRegen.characterPremiumAccount, "getPremiumAccountType")
        .mockResolvedValue(UserAccountTypes.PremiumGold);

      // @ts-ignore
      const spy = jest.spyOn(manaRegen.characterMonitorInterval, "watch");

      await manaRegen.autoRegenManaHandler(testCharacter);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("processManaRegeneration", () => {
    it("should not regen mana if character is at max mana", async () => {
      testCharacter.mana = testCharacter.maxMana;
      await testCharacter.save();
      // @ts-ignore
      const spy = jest.spyOn(manaRegen.socketMessaging, "sendEventToUser");

      // @ts-ignore
      await manaRegen.processManaRegeneration(testCharacter, 10);
      expect(spy).not.toHaveBeenCalled();
    });

    // @ts-ignore
    it("should send socket event if mana is not at max after regen", async () => {
      testCharacter.mana = testCharacter.maxMana - 20;
      // @ts-ignore
      const spy = jest.spyOn(manaRegen.socketMessaging, "sendEventToUser");

      // @ts-ignore
      await manaRegen.processManaRegeneration(testCharacter, 10);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("shouldSkipManaRegen", () => {
    it("should return true for non-mage free account", async () => {
      testCharacter.class = CharacterClass.Warrior;
      // @ts-ignore
      const result = await manaRegen.shouldSkipManaRegen(testCharacter, UserAccountTypes.Free);
      expect(result).toBeTruthy();
    });

    it("should return false for mage premium account", async () => {
      // @ts-ignore
      const result = await manaRegen.shouldSkipManaRegen(testCharacter, UserAccountTypes.PremiumUltimate);
      expect(result).toBeFalsy();
    });
  });
});
